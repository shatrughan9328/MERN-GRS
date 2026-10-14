/**
 * Non-Destructive AI Analysis Backfill Migration
 * Enriches pre-existing complaints in MongoDB with AI prioritization and department mapping.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Complaint = require("../model/Complaint");
const ComplaintType = require("../model/ComplaintType");
const { analyzeGrievance } = require("../services/ai/aiProvider");

async function backfill() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/grs";
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);

    const complaints = await Complaint.find().populate("complaintType");
    console.log(`Found ${complaints.length} complaints to check.`);

    let updatedCount = 0;
    for (const c of complaints) {
      // Check if already analyzed
      if (c.aiAnalysis && c.aiAnalysis.priority && c.aiAnalysis.status === "success") {
        console.log(`Complaint ${c._id} already analyzed.`);
        continue;
      }

      const typeName = c.complaintType?.name || "";
      const analysis = await analyzeGrievance(c.complaint, typeName);

      c.aiAnalysis = analysis;
      if (!c.departmentAssignment || !c.departmentAssignment.department) {
        c.departmentAssignment = {
          department: analysis.recommendedDepartment,
          status: "suggested",
        };
      }

      await c.save();
      updatedCount++;
      console.log(`Updated complaint ${c._id}: Priority=${analysis.priority}, Category=${analysis.category}, Dept=${analysis.recommendedDepartment}`);
    }

    console.log(`\nBackfill complete! Updated ${updatedCount} complaints.`);
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

backfill();
