const express = require("express");
const routes = express.Router();
const ComplaintType = require("../model/ComplaintType");

// Add Complaint Type
routes.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    const data = await ComplaintType.findOne({ name });

    if (data) {
      return res.json({
        msg: "Complaint Type already Exist",
      });
    }

    const saveComplaint = new ComplaintType({
      name,
      description,
    });

    await saveComplaint.save();

    res.json({
      msg: "Complaint Type Added Successfully",
    });

  } catch (error) {
    console.log(error);

    res.json({
      msg: "Complaint type not added",
    });
  }
});

// Get Complaint Types
routes.get("/", async (req, res) => {
  try {
    const data = await ComplaintType.find();

    res.json({
      msg: "Complaint type fetched",
      data: data,
    });

  } catch (error) {
    console.log(error);

    res.json({
      msg: "Complaint type not fetched",
    });
  }
});

// Update Complaint Type
routes.patch("/:id", async (req, res) => {
  try {
    await ComplaintType.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    res.json({
      msg: "Complaint type updated Successfully",
    });

  } catch (error) {
    console.log(error);

    res.json({
      msg: "Complaint type not update",
    });
  }
});

// Delete Complaint Type
routes.delete("/:id", async (req, res) => {
  try {
    await ComplaintType.findByIdAndDelete(
      req.params.id
    );

    res.json({
      msg: "Complaint type deleted",
    });

  } catch (error) {
    console.log(error);

    res.json({
      msg: "Complaint type not deleted",
    });
  }
});

module.exports = routes;