/**
 * Student AI Chatbot Service
 * Provides secure contextual grievance guidance, complaint status tracking,
 * category recommendations, and drafting help.
 */

const Complaint = require("../../model/Complaint");
const Student = require("../../model/Student");
const { classifyWithRules } = require("./ruleBasedClassifier");

/**
 * Handle student chat query
 * @param {string} message - Student input message
 * @param {Array} history - Previous messages [{ role: 'user' | 'assistant', content: string }]
 * @param {string} studentId - Authenticated student MongoDB ID
 * @returns {Promise<{ reply: string, suggestions: string[], tickets?: Array }>}
 */
async function handleStudentChat(message, history = [], studentId) {
  if (!message || typeof message !== "string") {
    throw new Error("Message text is required");
  }

  // 1. Fetch student's profile & verified grievances
  const [student, complaints] = await Promise.all([
    Student.findById(studentId).select("name email course").lean(),
    Complaint.find({ studentId })
      .populate("complaintType")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const studentName = student?.name || "Student";

  // Summarize student's tickets for grounding
  const ticketSummaries = complaints.map((c, i) => {
    const type = c.complaintType?.name || c.aiAnalysis?.category || "General";
    const effectivePriority = c.priorityOverride?.priority || c.aiAnalysis?.priority || "LOW";
    const dept = c.departmentAssignment?.department || c.aiAnalysis?.recommendedDepartment || "General Administration";
    const statusMap = {
      notProcessed: "Not Processed (Pending Review)",
      pending: "Under Review by Committee",
      closed: "Resolved & Closed",
    };
    const friendlyStatus = statusMap[c.status] || c.status;
    const shortText = c.complaint.length > 80 ? c.complaint.substring(0, 80) + "..." : c.complaint;
    const date = new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `Ticket #${i + 1} [ID: ...${c._id.toString().slice(-6)}]: Category: ${type} | Status: ${friendlyStatus} | Priority: ${effectivePriority} | Dept: ${dept} | Date: ${date} | Summary: "${shortText}"`;
  });

  const ticketsContext = ticketSummaries.length > 0
    ? ticketSummaries.join("\n")
    : "The student has not submitted any grievance tickets yet.";

  // Check if LLM is configured
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const provider = (process.env.AI_PROVIDER || "auto").toLowerCase();

  if (!apiKey || provider === "rule-based") {
    // Intelligent Contextual Rule Engine
    return handleRuleBasedChat(message, studentName, complaints);
  }

  // Use LLM
  const systemPrompt = `You are the friendly, professional, and knowledgeable AI Grievance Redressal Assistant for ${studentName} at the College Grievance Redressal System (GRS).

VERIFIED STUDENT CONTEXT:
Student Name: ${studentName}
Enrolled Course: ${student?.course || "Undergraduate"}
Existing Grievance Tickets (AUTHORIZED ACCESS ONLY):
${ticketsContext}

STRICT OPERATIONAL GUIDELINES:
1. Grievance Status:
   - When asked about their tickets/complaints, provide clear, accurate summaries strictly using the verified tickets listed above.
   - State the current status, assigned priority (HIGH/MEDIUM/LOW), and department.
   - If they have no complaints, gently guide them to lodge one using the '+ New Complaint' page.
2. Complaint Drafting & Missing Details:
   - If the student drafts a complaint, evaluate it. Praise good details, but point out missing essentials (e.g., specific campus room/block, date/time, affected equipment ID, witness or contact details).
3. Priorities & Categories:
   - HIGH: Immediate physical safety hazards, violence, harassment, ragging, or severe electrical/water risks.
   - MEDIUM: Significant academic delays (exams, marks), scholarship/fee billing issues, or lab disruptions.
   - LOW: Routine non-urgent maintenance, general requests.
4. Privacy & Integrity:
   - You NEVER have access to other students' information or internal admin deliberation notes.
   - Never invent or fabricate ticket status.
   - Keep answers clear, supportive, and formatted with concise bullet points where appropriate.`;

  try {
    let reply = "";
    if (provider === "gemini" || apiKey.startsWith("AIza") || process.env.GEMINI_API_KEY) {
      const model = process.env.AI_MODEL || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const chatContents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready to assist the student with grievance redressal, ticket tracking, and drafting support." }] },
      ];

      // Add recent history (up to 4 turns)
      const recent = (history || []).slice(-4);
      for (const h of recent) {
        chatContents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }

      chatContents.push({ role: "user", parts: [{ text: message }] });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: chatContents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Gemini error: ${resp.status}`);
      }

      const data = await resp.json();
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      // OpenAI-compatible
      const model = process.env.AI_MODEL || "gpt-3.5-turbo";
      const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";

      const messages = [
        { role: "system", content: systemPrompt },
        ...(history || []).slice(-4),
        { role: "user", content: message },
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`OpenAI error: ${resp.status}`);
      }

      const data = await resp.json();
      reply = data?.choices?.[0]?.message?.content;
    }

    return {
      reply: reply || "I am here to help you navigate your college grievances. What can I assist you with today?",
      suggestions: [
        "What is the status of my complaints?",
        "How do priority levels work?",
        "Help me draft a grievance",
        "What departments handle fees?",
      ],
    };
  } catch (error) {
    console.warn("[Chatbot] LLM invocation failed, falling back to rule-based chat:", error.message);
    return handleRuleBasedChat(message, studentName, complaints);
  }
}

/**
 * Intelligent Rule-Based Dialog Engine for Zero-Downtime Guarantee
 */
function handleRuleBasedChat(message, studentName, complaints) {
  const q = message.toLowerCase().trim();

  // 1. Complaint Status Query
  if (
    q.includes("status") ||
    q.includes("my complaint") ||
    q.includes("my ticket") ||
    q.includes("track") ||
    q.includes("progress") ||
    q.includes("check")
  ) {
    if (!complaints || complaints.length === 0) {
      return {
        reply: `Hello **${studentName}**, you haven't submitted any grievances yet. \n\nYou can click **Submit Complaint** in your left navigation to register a grievance with the college administration. Once submitted, our AI will automatically prioritize it and track its resolution!`,
        suggestions: ["How do I submit a complaint?", "What are the priority levels?", "Which categories are available?"],
      };
    }

    let reply = `Hello **${studentName}**, here is the live status of your recent grievance tickets:\n\n`;
    complaints.slice(0, 3).forEach((c, idx) => {
      const type = c.complaintType?.name || c.aiAnalysis?.category || "General";
      const priority = c.priorityOverride?.priority || c.aiAnalysis?.priority || "LOW";
      const dept = c.departmentAssignment?.department || c.aiAnalysis?.recommendedDepartment || "General Administration";
      const statusMap = {
        notProcessed: "⏳ **Not Processed** (Awaiting officer assignment)",
        pending: "🔍 **Under Review** (Active committee investigation)",
        closed: "✅ **Resolved** (Action completed)",
      };
      const statusStr = statusMap[c.status] || c.status;
      reply += `**${idx + 1}. Ticket #${c._id.toString().slice(-6)}** (${type})\n`;
      reply += `• **Status:** ${statusStr}\n`;
      reply += `• **Priority:** \`${priority}\` | **Department:** ${dept}\n`;
      reply += `• **Summary:** "${c.complaint.slice(0, 75)}..."\n\n`;
    });

    reply += `You can review full history anytime under **My Complaints**.`;

    return {
      reply,
      suggestions: ["How do priority levels work?", "Help me write a complaint", "How long does review take?"],
    };
  }

  // 2. Priority Levels Query
  if (q.includes("priority") || q.includes("high") || q.includes("medium") || q.includes("low")) {
    return {
      reply: `Our AI uses three objective priority tiers to ensure critical cases are handled swiftly:\n\n` +
        `🔴 **HIGH Priority:** Immediate safety hazards (fire, electric shock, chemical leak), violent threats, ragging, or severe harassment. Flagged for instant human review.\n\n` +
        `🟡 **MEDIUM Priority:** Substantial academic, financial, or residential disruptions (e.g. exam admit card issues, fee payment errors, hostel water/power cuts, campus network downtime).\n\n` +
        `🔵 **LOW Priority:** Routine maintenance requests, library book suggestions, non-urgent facility upgrades, or general administrative feedback.`,
      suggestions: ["Check my complaint status", "Which category should I select?", "Help me draft a grievance"],
    };
  }

  // 3. Category / Department Query
  if (q.includes("category") || q.includes("categories") || q.includes("department") || q.includes("type")) {
    return {
      reply: `Here are the available grievance categories and their respective redressal cells:\n\n` +
        `• 📚 **Academic:** Exam schedules, evaluation, attendance, marksheet disputes (Academic Affairs)\n` +
        `• 🏢 **Infrastructure:** Classroom amenities, fans, ACs, washrooms, drinking water (Estate & Infra)\n` +
        `• 💳 **Accounts:** College fee receipts, scholarship delays, refund disputes (Finance & Accounts)\n` +
        `• 💻 **IT & Systems:** Campus Wi-Fi, ERP portal, computer labs, password lockouts (IT Dept)\n` +
        `• 🛡️ **Safety & Harassment:** Physical safety, bullying, ragging, harassment (Safety & ICC Cell)\n` +
        `• 🥗 **Student Welfare:** Hostel room, mess food quality, sports, medical facilities (Welfare Cell)`,
      suggestions: ["Help me write a complaint", "Check my complaint status", "What happens after submitting?"],
    };
  }

  // 4. Draft Help / Missing Information Evaluation
  if (q.length > 30 || q.includes("draft") || q.includes("write") || q.includes("help me submit") || q.includes("sample")) {
    const analysis = classifyWithRules(q);
    return {
      reply: `Here is a preview analysis of your grievance draft:\n\n` +
        `• **Estimated Priority:** \`${analysis.priority}\`\n` +
        `• **Recommended Category:** **${analysis.category}**\n` +
        `• **Designated Redressal Cell:** *${analysis.recommendedDepartment}*\n\n` +
        `💡 **Tips to strengthen your ticket:**\n` +
        `1. Specify the exact location (e.g., *Block B, 3rd Floor, Room 302*).\n` +
        `2. Note the date and time when the issue started.\n` +
        `3. Keep the tone objective and state the specific resolution you request.\n\n` +
        `Would you like to lodge this under **Submit Complaint**?`,
      suggestions: ["Submit this complaint", "Check my complaint status", "How are complaints prioritized?"],
    };
  }

  // 5. Default Response
  return {
    reply: `Hello **${studentName}**! I am your AI Grievance Assistant.\n\n` +
      `I can help you with:\n` +
      `• Checking the real-time status and priority of your submitted grievances\n` +
      `• Explaining complaint categories and assigning departments\n` +
      `• Reviewing your draft complaint to ensure all vital facts are included\n` +
      `• Understanding High, Medium, and Low priority rules\n\n` +
      `How can I assist you right now?`,
    suggestions: [
      "Check my complaint status",
      "How do priority levels work?",
      "Which categories are available?",
      "Help me draft a grievance",
    ],
  };
}

module.exports = {
  handleStudentChat,
};
