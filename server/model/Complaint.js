const mongoose = require("mongoose");
// Pre-register referenced models
require("./ComplaintType");
require("./Student");
require("./Admin");

const complaintSchema = mongoose.Schema(
  {
    // Original Fields (Preserved)
    complaintType: {
      type: mongoose.Schema.ObjectId,
      ref: "ComplaintType",
    },
    complaint: {
      type: String,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Student",
    },
    status: {
      type: String,
      enum: ["notProcessed", "pending", "closed"],
      default: "notProcessed",
    },

    // Optional Title for enhanced readability
    title: {
      type: String,
      trim: true,
    },

    // AI Prioritization & Classification Metadata
    aiAnalysis: {
      priority: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"],
        default: "LOW",
      },
      category: {
        type: String,
        default: "Other",
      },
      recommendedDepartment: {
        type: String,
        default: "General Administration",
      },
      reason: {
        type: String,
        default: "",
      },
      confidence: {
        type: Number,
        default: 0.0,
      },
      requiresUrgentReview: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["pending", "success", "fallback", "failed"],
        default: "pending",
      },
      analyzedAt: {
        type: Date,
      },
      model: {
        type: String,
        default: "none",
      },
      rawOutput: {
        type: String,
      },
    },

    // Administrator Priority Override with Audit Trail
    priorityOverride: {
      priority: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"],
      },
      changedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "Admin",
      },
      changedByName: {
        type: String,
      },
      changedAt: {
        type: Date,
      },
      reason: {
        type: String,
      },
    },

    // Department Assignment & Confirmation
    departmentAssignment: {
      department: {
        type: String,
      },
      status: {
        type: String,
        enum: ["suggested", "confirmed", "reassigned"],
        default: "suggested",
      },
      assignedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "Admin",
      },
      assignedAt: {
        type: Date,
      },
      notes: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual helper for effective priority (Override priority if exists, else AI priority)
complaintSchema.virtual("effectivePriority").get(function () {
  if (this.priorityOverride && this.priorityOverride.priority) {
    return this.priorityOverride.priority;
  }
  return this.aiAnalysis?.priority || "LOW";
});

// Configure JSON serialization to include virtuals
complaintSchema.set("toJSON", { virtuals: true });
complaintSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Complaint", complaintSchema);