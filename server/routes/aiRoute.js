const express = require("express");
const routes = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { handleStudentChat } = require("../services/ai/chatbotService");
const { analyzeGrievance } = require("../services/ai/aiProvider");
const { classifyWithRules } = require("../services/ai/ruleBasedClassifier");

/**
 * POST /api/ai/chat
 * Student Chatbot Endpoint (Authenticated)
 */
routes.post("/chat", verifyToken, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Message is required and must be non-empty.",
      });
    }

    // Rate / length check
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        msg: "Message exceeds 2000 characters limit.",
      });
    }

    // Pass authenticated user ID strictly from JWT
    const response = await handleStudentChat(message, history || [], req.user.id);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Chatbot endpoint error:", error);
    res.status(500).json({
      success: false,
      msg: "An error occurred while processing your chat request.",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/preview
 * Live pre-submission grievance analysis & drafting tips
 */
routes.post("/preview", async (req, res) => {
  try {
    const { text, categoryName } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({
        success: false,
        msg: "Grievance text must be at least 5 characters.",
      });
    }

    // Run quick classification
    const analysis = await analyzeGrievance(text, categoryName || "");

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Preview endpoint error:", error);
    // Even if error, return fallback
    const fallback = classifyWithRules(req.body.text || "", req.body.categoryName || "");
    res.json({
      success: true,
      data: {
        ...fallback,
        status: "fallback",
        model: "rule-based-engine",
      },
    });
  }
});

/**
 * GET /api/ai/status
 * Public AI system health & provider info (No secrets exposed)
 */
routes.get("/status", (req, res) => {
  const provider = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const hasKey = Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

  let activeProvider = "rule-based";
  if (hasKey && provider !== "rule-based") {
    activeProvider = provider === "auto" ? "gemini / openai" : provider;
  }

  res.json({
    success: true,
    data: {
      provider: activeProvider,
      isLiveLLM: hasKey && provider !== "rule-based",
      model: process.env.AI_MODEL || (activeProvider === "rule-based" ? "heuristic-v1" : "auto"),
      status: "online",
    },
  });
});

module.exports = routes;
