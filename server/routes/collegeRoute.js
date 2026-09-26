// 

const express = require("express");
const routes = express.Router();
const College = require("../model/College");

// Get all colleges
routes.get("/", async (req, res) => {
  try {
    const data = await College.find();

    res.json({
      msg: "College fetched successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "College not fetched",
    });
  }
});

// Add college
routes.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    const data = new College({
      name: name,
      description: description,
    });

    await data.save();

    res.json({
      msg: "College Added Successfully",
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "College not added",
    });
  }
});

// Update college
routes.patch("/:id", async (req, res) => {
  try {
    await College.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      msg: "College Updated Successfully",
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "College Not Updated",
    });
  }
});

// Delete college
routes.delete("/:id", async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);

    res.json({
      msg: "College Deleted Successfully",
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "College not deleted",
    });
  }
});

module.exports = routes;