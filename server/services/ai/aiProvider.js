/**
 * AI Provider Abstraction Layer
 * Supports Google Gemini, OpenAI-compatible APIs (OpenAI, Groq, OpenRouter, Ollama),
 * and Rule-Based Fallback.
 */

const { validateAiAnalysis, VALID_CATEGORIES, VALID_DEPARTMENTS } = require("./aiValidator");
const { classifyWithRules } = require("./ruleBasedClassifier");

const SYSTEM_PROMPT = `You are an expert College Grievance Classification and Redressal AI Assistant.
Analyze the student grievance carefully and classify it into a structured JSON response.

CLASSIFICATION GUIDELINES:
- HIGH Priority: Immediate physical safety risks, violence, credible threats, sexual harassment, ragging, severe structural or electrical hazards, or urgent incidents requiring emergency human intervention. Flag 'requiresUrgentReview': true.
- MEDIUM Priority: Significant academic disruptions (exams, results, attendance), financial discrepancies (fees, scholarships), essential living facility breakdown (no water, power outage, broken lock), or critical campus IT outage.
- LOW Priority: Minor routine maintenance, general suggestions, non-urgent inquiries, elective facility requests.

CATEGORIES ALLOWED:
${VALID_CATEGORIES.join(", ")}

RECOMMENDED DEPARTMENTS:
${VALID_DEPARTMENTS.join(", ")}

You MUST respond strictly with a valid JSON object with EXACTLY this structure:
{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "category": "Academic" | "Infrastructure" | "Accounts" | "IT" | "Safety" | "Harassment" | "Student Welfare" | "Other",
  "recommendedDepartment": "<Department Name>",
  "reason": "<Concise 1-2 sentence justification for the assigned priority and department>",
  "confidence": <number between 0.0 and 1.0>,
  "requiresUrgentReview": <true | false>
}`;

/**
 * Call Google Gemini API
 */
async function callGemini(complaintText, categoryName, apiKey, modelName) {
  const model = modelName || process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userPrompt = `Student Grievance Description:\n"""${complaintText}"""\n\nStudent Selected Category: "${categoryName || "Unspecified"}"`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT },
              { text: userPrompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response from Gemini API");
    }

    return JSON.parse(candidateText);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call OpenAI-compatible API (OpenAI, Groq, Ollama, DeepSeek)
 */
async function callOpenAICompatible(complaintText, categoryName, apiKey, modelName, baseUrl) {
  const model = modelName || process.env.AI_MODEL || "gpt-3.5-turbo";
  const endpoint = `${baseUrl || "https://api.openai.com/v1"}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Student Grievance:\n"""${complaintText}"""\nCategory Hint: "${categoryName || "None"}"`,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty choice returned from OpenAI API");
    }

    return JSON.parse(content);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Master Analysis Function
 * Inspects environment, calls active provider, validates schema, and falls back seamlessly.
 *
 * @param {string} text - The grievance text
 * @param {string} existingTypeName - Student's selected category name if any
 * @returns {Promise<object>} Complete analysis record to store in MongoDB
 */
async function analyzeGrievance(text, existingTypeName = "") {
  const provider = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL;
  const baseUrl = process.env.AI_BASE_URL;

  // Determine provider if auto
  let activeProvider = provider;
  if (provider === "auto") {
    if (apiKey && (apiKey.startsWith("AIza") || process.env.GEMINI_API_KEY)) {
      activeProvider = "gemini";
    } else if (apiKey) {
      activeProvider = "openai";
    } else {
      activeProvider = "rule-based";
    }
  }

  // 1. If explicit or implicit rule-based (no key)
  if (activeProvider === "rule-based" || !apiKey) {
    const fallbackResult = classifyWithRules(text, existingTypeName);
    return {
      ...fallbackResult,
      status: "fallback",
      model: "rule-based-engine",
      analyzedAt: new Date(),
      provider: "rule-based",
      note: apiKey ? "Rule-based engine selected." : "Live AI API key not configured; high-accuracy heuristic fallback applied.",
    };
  }

  // 2. Try LLM Call
  try {
    let rawOutput;
    let modelUsed = model;

    if (activeProvider === "gemini") {
      modelUsed = model || "gemini-1.5-flash";
      rawOutput = await callGemini(text, existingTypeName, apiKey, modelUsed);
    } else {
      modelUsed = model || "gpt-3.5-turbo";
      rawOutput = await callOpenAICompatible(text, existingTypeName, apiKey, modelUsed, baseUrl);
    }

    // Validate and normalize
    const validated = validateAiAnalysis(rawOutput);
    if (!validated.isValid) {
      throw new Error(`AI validation failed: ${validated.errors.join(", ")}`);
    }

    return {
      ...validated.data,
      status: "success",
      model: `${activeProvider}:${modelUsed}`,
      analyzedAt: new Date(),
      provider: activeProvider,
      rawOutput: JSON.stringify(rawOutput),
    };
  } catch (error) {
    console.warn(`[AI-Service] LLM Provider (${activeProvider}) call failed: ${error.message}. Engaging rule-based fallback.`);

    // Safe Fallback
    const fallbackResult = classifyWithRules(text, existingTypeName);
    return {
      ...fallbackResult,
      status: "fallback",
      model: "rule-based-fallback",
      analyzedAt: new Date(),
      provider: activeProvider,
      error: error.message,
      note: "External AI provider unavailable or timed out; heuristic rule-engine fallback preserved grievance analysis.",
    };
  }
}

module.exports = {
  analyzeGrievance,
  SYSTEM_PROMPT,
};
