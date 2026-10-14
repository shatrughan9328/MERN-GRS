const express = require("express");
const routes = express.Router();
const Complaint = require("../model/Complaint");
const ComplaintType = require("../model/ComplaintType");
const Admin = require("../model/Admin");
const { optionalAuth, verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { analyzeGrievance } = require("../services/ai/aiProvider");

// ==========================================
// 1. GET ALL COMPLAINTS (ADMIN & AUTHORIZED)
// ==========================================
routes.get("/", async (req, res) => {
  try {
    const data = await Complaint.find()
      .populate("complaintType")
      .populate("studentId")
      .populate("priorityOverride.changedBy", "email")
      .populate("departmentAssignment.assignedBy", "email")
      .sort({ createdAt: -1 });

    res.json({
      msg: "Complaints fetched successfully",
      data,
    });
  } catch (er) {
    console.error("Fetch complaints error:", er);
    res.json({
      msg: "Complaints not fetched",
      error: er.message,
    });
  }
});

// ==========================================
// 2. ANALYTICS SUMMARY (MUST BE BEFORE /:id)
// ==========================================
routes.get("/analytics/summary", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("complaintType")
      .lean();

    const total = complaints.length;

    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    let awaitingReview = 0; // notProcessed + pending
    let aiAnalyzed = 0;
    let urgentReview = 0;

    const categoryCounts = {};
    const departmentCounts = {};
    const statusCounts = {
      notProcessed: 0,
      pending: 0,
      closed: 0,
    };

    complaints.forEach((c) => {
      // Effective priority
      const effectivePriority = c.priorityOverride?.priority || c.aiAnalysis?.priority || "LOW";
      if (effectivePriority === "HIGH") highPriority++;
      else if (effectivePriority === "MEDIUM") mediumPriority++;
      else lowPriority++;

      // Review statuses
      if (c.status === "notProcessed" || c.status === "pending") {
        awaitingReview++;
      }
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }

      // AI analyzed
      if (c.aiAnalysis?.status === "success" || c.aiAnalysis?.status === "fallback") {
        aiAnalyzed++;
      }

      // Urgent safety review flag
      if (c.aiAnalysis?.requiresUrgentReview) {
        urgentReview++;
      }

      // Category counts
      const cat = c.aiAnalysis?.category || c.complaintType?.name || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Department counts
      const dept = c.departmentAssignment?.department || c.aiAnalysis?.recommendedDepartment || "General Administration";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total,
        highPriority,
        mediumPriority,
        lowPriority,
        awaitingReview,
        aiAnalyzed,
        urgentReview,
        statusCounts,
        categoryCounts,
        departmentCounts,
      },
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to generate analytics summary",
      error: error.message,
    });
  }
});

// ==========================================
// 3. ADD COMPLAINT (WITH AI ANALYSIS)
// ==========================================
routes.post("/", async (req, res) => {
  try {
    const { complaintType, complaint, studentId, title } = req.body;

    if (!complaintType || !complaint || !studentId) {
      return res.json({
        msg: "All fields are required",
      });
    }

    // Fetch complaint type name for contextual category grounding
    let typeName = "";
    try {
      const typeDoc = await ComplaintType.findById(complaintType);
      if (typeDoc) {
        typeName = typeDoc.name;
      }
    } catch (e) {
      // Ignore lookup error, proceed with analysis
    }

    // Execute AI Grievance Prioritization & Classification
    let aiResult;
    try {
      aiResult = await analyzeGrievance(complaint, typeName);
    } catch (aiErr) {
      console.warn("AI analysis execution failure:", aiErr.message);
      aiResult = {
        priority: "LOW",
        category: typeName || "Other",
        recommendedDepartment: "General Administration",
        reason: "Initial submission received; automated AI analysis pending.",
        confidence: 0.5,
        requiresUrgentReview: false,
        status: "failed",
        analyzedAt: new Date(),
        model: "pending-retry",
      };
    }

    // Create & Save Complaint
    const data = new Complaint({
      complaintType,
      complaint,
      studentId,
      title: title || complaint.slice(0, 60),
      aiAnalysis: aiResult,
      departmentAssignment: {
        department: aiResult.recommendedDepartment,
        status: "suggested",
      },
    });

    await data.save();

    res.json({
      msg: "Complaint Added Successfully",
      data,
    });
  } catch (er) {
    console.error("Add complaint error:", er);
    res.json({
      msg: "Complaint not added",
      error: er.message,
    });
  }
});

// ==========================================
// 4. GET STUDENT COMPLAINTS
// (MUST COME BEFORE /:id)
// ==========================================
routes.get("/student/:studentId", optionalAuth, async (req, res) => {
  try {
    // If authenticated as a student, enforce that they can only access their own complaints
    if (req.user && req.user.role === "Student" && req.user.id !== req.params.studentId) {
      return res.status(403).json({
        msg: "Unauthorized access: You can only view your own complaints.",
      });
    }

    const data = await Complaint.find({
      studentId: req.params.studentId,
    })
      .populate("complaintType")
      .sort({ createdAt: -1 });

    res.json({
      msg: "Student complaints fetched successfully",
      data,
    });
  } catch (er) {
    console.error("Fetch student complaints error:", er);
    res.json({
      msg: "Student complaints not fetched",
    });
  }
});

// ==========================================
// 5. UPDATE COMPLAINT STATUS
// ==========================================
routes.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["notProcessed", "pending", "closed"].includes(status)) {
      return res.json({
        msg: "Invalid complaint status",
      });
    }

    const data = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("complaintType")
      .populate("studentId");

    res.json({
      msg: "Complaint Status Updated Successfully",
      data,
    });
  } catch (er) {
    console.error("Status update error:", er);
    res.json({
      msg: "Complaint Status Not Updated",
    });
  }
});

// ==========================================
// 6. ADMIN PRIORITY OVERRIDE
// ==========================================
routes.patch("/:id/priority-override", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { priority, reason } = req.body;

    if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid priority. Must be HIGH, MEDIUM, or LOW.",
      });
    }

    let adminName = "Admin";
    try {
      const adminDoc = await Admin.findById(req.user.id);
      if (adminDoc) adminName = adminDoc.email;
    } catch (e) {}

    const data = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        priorityOverride: {
          priority,
          changedBy: req.user.id,
          changedByName: adminName,
          changedAt: new Date(),
          reason: reason || "Manual priority override by administrator.",
        },
      },
      { new: true }
    )
      .populate("complaintType")
      .populate("studentId");

    if (!data) {
      return res.status(404).json({ success: false, msg: "Complaint not found" });
    }

    res.json({
      success: true,
      msg: "Priority override applied successfully",
      data,
    });
  } catch (error) {
    console.error("Priority override error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to override priority",
      error: error.message,
    });
  }
});

// ==========================================
// 7. ADMIN DEPARTMENT ASSIGNMENT
// ==========================================
routes.patch("/:id/assign-department", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { department, notes, status } = req.body;

    if (!department) {
      return res.status(400).json({
        success: false,
        msg: "Department name is required.",
      });
    }

    const data = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        departmentAssignment: {
          department,
          assignedBy: req.user.id,
          assignedAt: new Date(),
          notes: notes || "",
          status: status || "confirmed",
        },
      },
      { new: true }
    )
      .populate("complaintType")
      .populate("studentId");

    if (!data) {
      return res.status(404).json({ success: false, msg: "Complaint not found" });
    }

    res.json({
      success: true,
      msg: "Department assignment updated successfully",
      data,
    });
  } catch (error) {
    console.error("Department assignment error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update department assignment",
      error: error.message,
    });
  }
});

// ==========================================
// 8. ADMIN RETRY AI ANALYSIS
// ==========================================
routes.post("/:id/retry-ai", verifyToken, requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("complaintType");

    if (!complaint) {
      return res.status(404).json({ success: false, msg: "Complaint not found" });
    }

    const typeName = complaint.complaintType?.name || "";
    const aiResult = await analyzeGrievance(complaint.complaint, typeName);

    complaint.aiAnalysis = aiResult;
    // If department was only suggested, update suggestion
    if (!complaint.departmentAssignment || complaint.departmentAssignment.status === "suggested") {
      complaint.departmentAssignment = {
        department: aiResult.recommendedDepartment,
        status: "suggested",
      };
    }

    await complaint.save();

    res.json({
      success: true,
      msg: "AI analysis re-evaluated successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Retry AI error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to retry AI analysis",
      error: error.message,
    });
  }
});

// ==========================================
// 9. GET SINGLE COMPLAINT
// ==========================================
routes.get("/:id", async (req, res) => {
  try {
    const data = await Complaint.findById(req.params.id)
      .populate("complaintType")
      .populate("studentId")
      .populate("priorityOverride.changedBy", "email")
      .populate("departmentAssignment.assignedBy", "email");

    if (!data) {
      return res.json({
        msg: "Complaint not found",
      });
    }

    res.json({
      msg: "Complaint fetched successfully",
      data,
    });
  } catch (er) {
    console.error(er);
    res.json({
      msg: "Complaint not fetched",
    });
  }
});

// ==========================================
// 10. UPDATE COMPLAINT (GENERAL)
// ==========================================
routes.patch("/:id", async (req, res) => {
  try {
    const data = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      msg: "Complaint Updated Successfully",
      data,
    });
  } catch (er) {
    console.error(er);
    res.json({
      msg: "Complaint Not Updated",
    });
  }
});

// ==========================================
// 11. DELETE COMPLAINT
// ==========================================
routes.delete("/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      msg: "Complaint Deleted Successfully",
    });
  } catch (er) {
    console.error(er);
    res.json({
      msg: "Complaint not deleted",
    });
  }
});

module.exports = routes;