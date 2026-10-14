/**
 * Automated Verification Suite for AI Grievance Management
 * Tests priority classification, category mapping, fallback behavior, and validation.
 */

const assert = require("assert");
const { classifyWithRules } = require("../services/ai/ruleBasedClassifier");
const { validateAiAnalysis } = require("../services/ai/aiValidator");
const { analyzeGrievance } = require("../services/ai/aiProvider");

console.log("=================================================");
console.log(" RUNNING AI GRIEVANCE SYSTEM TEST SUITE");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function itAsync(desc, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runTests() {
  // 1. High Priority Tests
  it("High Priority: Detects severe harassment & ragging as HIGH priority with urgent flag", () => {
    const res = classifyWithRules("Senior students are engaging in ragging and abusive harassment outside hostel block B.");
    assert.strictEqual(res.priority, "HIGH");
    assert.strictEqual(res.requiresUrgentReview, true);
    assert.strictEqual(res.category, "Harassment");
  });

  it("High Priority: Detects severe electrical fire hazard as HIGH priority", () => {
    const res = classifyWithRules("There is heavy sparking and short circuit near electrical meter room in main building, urgent danger of fire!");
    assert.strictEqual(res.priority, "HIGH");
    assert.strictEqual(res.requiresUrgentReview, true);
    assert.strictEqual(res.category, "Safety");
  });

  // 2. Medium Priority Tests
  it("Medium Priority: Classifies exam admit card issue as MEDIUM priority", () => {
    const res = classifyWithRules("Semester examination starts tomorrow but my admit card shows hall ticket error.");
    assert.strictEqual(res.priority, "MEDIUM");
    assert.strictEqual(res.category, "Academic");
    assert.strictEqual(res.recommendedDepartment, "Academic Affairs");
  });

  it("Medium Priority: Classifies fee payment discrepancy as MEDIUM priority", () => {
    const res = classifyWithRules("Semester fee deducted twice from bank account, scholarship receipt is not updating.");
    assert.strictEqual(res.priority, "MEDIUM");
    assert.strictEqual(res.category, "Accounts");
    assert.strictEqual(res.recommendedDepartment, "Finance & Accounts");
  });

  it("Medium Priority: Classifies Wi-Fi failure in computer lab as MEDIUM priority", () => {
    const res = classifyWithRules("Campus Wi-Fi is completely down in Computer Lab 3 during practical exam.");
    assert.strictEqual(res.priority, "MEDIUM");
    assert.strictEqual(res.category, "IT");
    assert.strictEqual(res.recommendedDepartment, "IT & Systems");
  });

  // 3. Low Priority Tests
  it("Low Priority: Classifies routine classroom bench or projector request as LOW priority", () => {
    const res = classifyWithRules("Whiteboard marker and projector remote in room 102 are not working smoothly.");
    assert.strictEqual(res.priority, "LOW");
    assert.strictEqual(res.category, "Infrastructure");
    assert.strictEqual(res.requiresUrgentReview, false);
  });

  // 4. Schema Validator Tests
  it("Schema Validator: Normalizes malformed priority and clamps confidence score", () => {
    const raw = {
      priority: "CRITICAL_HIGH",
      category: "random unknown category",
      recommendedDepartment: "",
      confidence: 1.45,
      requiresUrgentReview: false,
      reason: "Dangerous incident",
    };
    const validated = validateAiAnalysis(raw);
    assert.strictEqual(validated.isValid, true);
    assert.strictEqual(validated.data.priority, "HIGH");
    assert.strictEqual(validated.data.confidence, 1.0);
    // Since priority is HIGH, urgent review should be forced true
    assert.strictEqual(validated.data.requiresUrgentReview, true);
  });

  // 5. Fallback Behavior
  await itAsync("Provider Fallback: Gracefully delivers analysis even when no LLM key is configured", async () => {
    const res = await analyzeGrievance("Water cooler on second floor is leaking and drinking water smells foul.");
    assert.ok(res.priority === "MEDIUM" || res.priority === "LOW");
    assert.ok(res.status === "fallback" || res.status === "success");
    assert.ok(res.confidence > 0);
    assert.ok(typeof res.reason === "string" && res.reason.length > 0);
  });

  console.log("\n=================================================");
  console.log(` SUMMARY: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
