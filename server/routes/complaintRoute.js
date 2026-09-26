const express = require("express");
const routes = express.Router();
const Complaint = require("../model/Complaint");

// GET ALL COMPLAINTS
routes.get("/", async (req, res) => {
  try {
    const data = await Complaint.find()
      .populate("complaintType")
      .populate("studentId")
      .sort({ createdAt: -1 });

    res.json({
      msg: "Complaints fetched successfully",
      data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Complaints not fetched",
    });
  }
});

// ADD COMPLAINT
routes.post("/", async (req, res) => {
  try {
    const { complaintType, complaint, studentId } = req.body;

    if (!complaintType || !complaint || !studentId) {
      return res.json({
        msg: "All fields are required",
      });
    }

    const data = new Complaint({
      complaintType,
      complaint,
      studentId,
    });

    await data.save();

    res.json({
      msg: "Complaint Added Successfully",
      data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Complaint not added",
    });
  }
});

// IMPORTANT: STUDENT ROUTE MUST COME BEFORE /:id
routes.get("/student/:studentId", async (req, res) => {
  try {
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
    console.log(er);

    res.json({
      msg: "Student complaints not fetched",
    });
  }
});

// UPDATE STATUS
routes.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["notProcessed", "pending", "closed"].includes(status)
    ) {
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
    );

    res.json({
      msg: "Complaint Status Updated Successfully",
      data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Complaint Status Not Updated",
    });
  }
});

// GET SINGLE COMPLAINT
routes.get("/:id", async (req, res) => {
  try {
    const data = await Complaint.findById(req.params.id)
      .populate("complaintType")
      .populate("studentId");

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
    console.log(er);

    res.json({
      msg: "Complaint not fetched",
    });
  }
});

// UPDATE COMPLAINT
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
    console.log(er);

    res.json({
      msg: "Complaint Not Updated",
    });
  }
});

// DELETE COMPLAINT
routes.delete("/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      msg: "Complaint Deleted Successfully",
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Complaint not deleted",
    });
  }
});

module.exports = routes;