/**
 * Rule-Based Grievance Classifier Engine
 * Acts as high-fidelity fallback when external LLM API is unavailable,
 * unconfigured, or experiences network timeouts.
 */

// Keyword clusters with weights
const HIGH_PRIORITY_TRIGGERS = [
  // Safety, Violence & Threats
  "threat", "violence", "assault", "attack", "knife", "weapon", "bleed", "injury", "blood", "suicide", "emergency", "danger", "hazardous",
  // Severe Harassment & Ragging
  "ragging", "harassment", "harassed", "sexual", "molest", "stalking", "blackmail", "abuse", "abusive", "casteist", "slur", "discriminate",
  // Major Infrastructure / Life Hazards
  "fire", "gas leak", "short circuit", "sparking", "electric shock", "ceiling collapse", "structural damage", "water contamination", "food poison", "hospitalized", "unconscious"
];

const MEDIUM_PRIORITY_TRIGGERS = [
  // Academic & Administrative Disruptions
  "exam", "examination", "admit card", "hall ticket", "marksheet", "attendance short", "results delayed", "evaluat", "syllabus incomplete", "faculty absent",
  // Accounts & Finances
  "fee", "fees", "fee receipt", "fine imposed", "scholarship", "scholarship pending", "refund", "overcharged", "bank transaction", "payment", "payment failed", "billing", "challan",
  // Essential Living Services
  "water cooler", "no water", "drinking water", "power outage", "electricity cut", "washroom dirty", "bathroom tap", "mess food quality", "hostel door lock broken",
  // Technical Infrastructure
  "portal not working", "login error", "password reset", "wifi down", "server error", "lab computer crash"
];

const CATEGORY_MAP = [
  {
    category: "Harassment",
    department: "Internal Complaints Committee (ICC)",
    keywords: ["harass", "ragging", "molest", "sexual", "stalk", "abusive", "discriminate", "threat", "bully", "slur"],
    basePriority: "HIGH",
    urgent: true
  },
  {
    category: "Safety",
    department: "Disciplinary & Safety Committee",
    keywords: ["safety", "hazard", "fire", "electric shock", "sparking", "security guard", "fight", "theft", "stolen", "injury", "poison"],
    basePriority: "HIGH",
    urgent: true
  },
  {
    category: "Accounts",
    department: "Finance & Accounts",
    keywords: ["fee", "fees", "refund", "scholarship", "dues", "payment", "receipt", "fine", "account", "challan"],
    basePriority: "MEDIUM",
    urgent: false
  },
  {
    category: "IT",
    department: "IT & Systems",
    keywords: ["wifi", "wi-fi", "internet", "portal", "login", "server", "website", "software", "lab pc", "network", "system", "router"],
    basePriority: "MEDIUM",
    urgent: false
  },
  {
    category: "Academic",
    department: "Academic Affairs",
    keywords: ["exam", "examination", "marks", "attendance", "faculty", "professor", "class", "syllabus", "timetable", "lecture", "degree", "transcript", "course"],
    basePriority: "MEDIUM",
    urgent: false
  },
  {
    category: "Infrastructure",
    department: "Estate & Infrastructure",
    keywords: ["bench", "projector", "fan", "ac", "air condition", "cooler", "light", "washroom", "toilet", "tap", "lift", "elevator", "cleaning", "classroom", "hostel room", "plumbing"],
    basePriority: "LOW",
    urgent: false
  },
  {
    category: "Student Welfare",
    department: "Student Welfare & Hostel Cell",
    keywords: ["mess", "canteen", "food", "hostel warden", "roommate", "sports", "gym", "medical room", "counselor", "welfare"],
    basePriority: "LOW",
    urgent: false
  }
];

/**
 * Classify a complaint using heuristic semantic rules
 * @param {string} text - Complaint description or title
 * @param {string} existingTypeName - Existing category name if provided by student
 * @returns {object} Structured AI Analysis
 */
function classifyWithRules(text = "", existingTypeName = "") {
  const combined = `${text} ${existingTypeName}`.toLowerCase();

  // 1. Detect High Priority
  const highMatches = HIGH_PRIORITY_TRIGGERS.filter(term => combined.includes(term));
  const mediumMatches = MEDIUM_PRIORITY_TRIGGERS.filter(term => combined.includes(term));

  let priority = "LOW";
  let requiresUrgentReview = false;
  let reason = "Automated prioritization based on routine category guidelines.";
  let confidence = 0.82;

  if (highMatches.length > 0) {
    priority = "HIGH";
    requiresUrgentReview = true;
    confidence = 0.94;
    reason = `Classified as HIGH priority due to urgent terms detected (${highMatches.slice(0, 3).join(", ")}) posing potential safety or welfare risks.`;
  } else if (mediumMatches.length > 0) {
    priority = "MEDIUM";
    confidence = 0.88;
    reason = `Classified as MEDIUM priority due to operational or academic disruption terms detected (${mediumMatches.slice(0, 3).join(", ")}).`;
  } else {
    priority = "LOW";
    confidence = 0.80;
    reason = "Classified as LOW priority for routine maintenance, general query, or administrative feedback.";
  }

  // 2. Detect Category & Department
  let category = "Other";
  let recommendedDepartment = "General Administration";
  let highestCategoryScore = 0;

  for (const cat of CATEGORY_MAP) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (combined.includes(kw)) {
        score += 1;
      }
    }
    // Boost if existing type name matches
    if (existingTypeName && existingTypeName.toLowerCase().includes(cat.category.toLowerCase())) {
      score += 2;
    }

    if (score > highestCategoryScore) {
      highestCategoryScore = score;
      category = cat.category;
      recommendedDepartment = cat.department;
      if (cat.urgent && score > 0) {
        requiresUrgentReview = true;
        priority = "HIGH";
      }
    }
  }

  // Fallback to existing type name if category is Other and existing type is present
  if (category === "Other" && existingTypeName) {
    const matched = CATEGORY_MAP.find(c =>
      existingTypeName.toLowerCase().includes(c.category.toLowerCase()) ||
      c.keywords.some(k => existingTypeName.toLowerCase().includes(k))
    );
    if (matched) {
      category = matched.category;
      recommendedDepartment = matched.department;
    }
  }

  return {
    priority,
    category,
    recommendedDepartment,
    reason,
    confidence,
    requiresUrgentReview,
  };
}

module.exports = {
  classifyWithRules,
};
