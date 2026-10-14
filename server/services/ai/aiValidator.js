/**
 * Validation and normalization utility for AI Analysis outputs.
 */

const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const VALID_CATEGORIES = [
  "Academic",
  "Infrastructure",
  "Accounts",
  "IT",
  "Safety",
  "Harassment",
  "Student Welfare",
  "Other",
];

const VALID_DEPARTMENTS = [
  "Academic Affairs",
  "Estate & Infrastructure",
  "Finance & Accounts",
  "IT & Systems",
  "Student Welfare & Hostel Cell",
  "Disciplinary & Safety Committee",
  "Internal Complaints Committee (ICC)",
  "General Administration",
];

/**
 * Validate and sanitize structured AI analysis output
 * @param {object} raw - Parsed JSON from AI provider
 * @returns {{ isValid: boolean, data?: object, errors?: string[] }}
 */
function validateAiAnalysis(raw) {
  const errors = [];

  if (!raw || typeof raw !== "object") {
    return {
      isValid: false,
      errors: ["AI output is not a valid JSON object"],
    };
  }

  // 1. Priority
  let priority = typeof raw.priority === "string" ? raw.priority.toUpperCase().trim() : "";
  if (!VALID_PRIORITIES.includes(priority)) {
    // Attempt lenient extraction
    if (priority.includes("HIGH") || priority.includes("URGENT") || priority.includes("CRITICAL")) {
      priority = "HIGH";
    } else if (priority.includes("MED")) {
      priority = "MEDIUM";
    } else {
      priority = "LOW";
    }
  }

  // 2. Category
  let category = typeof raw.category === "string" ? raw.category.trim() : "Other";
  const matchedCategory = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === category.toLowerCase()
  );
  if (matchedCategory) {
    category = matchedCategory;
  } else {
    // Heuristic category mapping
    const lower = category.toLowerCase();
    if (lower.includes("academ") || lower.includes("exam") || lower.includes("teach") || lower.includes("facult")) {
      category = "Academic";
    } else if (lower.includes("infrastruct") || lower.includes("hostel") || lower.includes("water") || lower.includes("build") || lower.includes("room")) {
      category = "Infrastructure";
    } else if (lower.includes("fee") || lower.includes("account") || lower.includes("refund") || lower.includes("scholarship") || lower.includes("money")) {
      category = "Accounts";
    } else if (lower.includes("wifi") || lower.includes("net") || lower.includes("portal") || lower.includes("login") || lower.includes("comput") || lower.includes("lab")) {
      category = "IT";
    } else if (lower.includes("harass") || lower.includes("ragging") || lower.includes("abuse") || lower.includes("threat") || lower.includes("sexual")) {
      category = "Harassment";
    } else if (lower.includes("safe") || lower.includes("hazard") || lower.includes("fire") || lower.includes("electric shock")) {
      category = "Safety";
    } else if (lower.includes("welfar") || lower.includes("mess") || lower.includes("canteen") || lower.includes("food")) {
      category = "Student Welfare";
    } else {
      category = "Other";
    }
  }

  // 3. Recommended Department
  let recommendedDepartment = typeof raw.recommendedDepartment === "string" ? raw.recommendedDepartment.trim() : "";
  if (!recommendedDepartment) {
    // Assign department based on category
    switch (category) {
      case "Academic":
        recommendedDepartment = "Academic Affairs";
        break;
      case "Infrastructure":
        recommendedDepartment = "Estate & Infrastructure";
        break;
      case "Accounts":
        recommendedDepartment = "Finance & Accounts";
        break;
      case "IT":
        recommendedDepartment = "IT & Systems";
        break;
      case "Safety":
        recommendedDepartment = "Disciplinary & Safety Committee";
        break;
      case "Harassment":
        recommendedDepartment = "Internal Complaints Committee (ICC)";
        break;
      case "Student Welfare":
        recommendedDepartment = "Student Welfare & Hostel Cell";
        break;
      default:
        recommendedDepartment = "General Administration";
    }
  }

  // 4. Reason
  let reason = typeof raw.reason === "string" ? raw.reason.trim() : "Automated prioritization based on grievance context.";
  if (reason.length > 600) {
    reason = reason.substring(0, 597) + "...";
  }

  // 5. Confidence
  let confidence = Number(raw.confidence);
  if (isNaN(confidence) || confidence < 0) {
    confidence = 0.85;
  } else if (confidence > 1.0) {
    confidence = 1.0;
  }

  // 6. Requires Urgent Review
  let requiresUrgentReview = Boolean(raw.requiresUrgentReview);
  if (priority === "HIGH" || category === "Harassment" || category === "Safety") {
    requiresUrgentReview = true;
  }

  return {
    isValid: true,
    data: {
      priority,
      category,
      recommendedDepartment,
      reason,
      confidence: Math.round(confidence * 100) / 100,
      requiresUrgentReview,
    },
  };
}

module.exports = {
  validateAiAnalysis,
  VALID_PRIORITIES,
  VALID_CATEGORIES,
  VALID_DEPARTMENTS,
};
