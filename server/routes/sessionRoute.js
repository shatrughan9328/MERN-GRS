const express = require("express");
const routes = express.Router();
const Session = require("../model/Session");

// Get all sessions
routes.get("/", async (req, res) => {
  try {
    const data = await Session.find();

    res.json({
      msg: "Session fetched successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Session not fetched",
    });
  }
});

// Add new session
routes.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    const data = new Session({
      name: name,
      description: description,
    });

    await data.save();

    res.json({
      msg: "Session Added Successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Session not added",
    });
  }
});

// Update session
routes.patch("/:id", async (req, res) => {
  try {
    const data = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!data) {
      return res.json({
        msg: "Session not found",
      });
    }

    res.json({
      msg: "Session Updated Successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Session Not Updated",
    });
  }
});

// Delete session
routes.delete("/:id", async (req, res) => {
  try {
    const data = await Session.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.json({
        msg: "Session not found",
      });
    }

    res.json({
      msg: "Session Deleted Successfully",
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Session not deleted",
    });
  }
});

module.exports = routes;