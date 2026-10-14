const express = require("express");
const routes = express.Router();
const Student = require("../model/Student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// STUDENT REGISTER
routes.post("/register", async (req, res) => {
  try {
    const {
      name,
      fatherName,
      email,
      gender,
      password,
      address,
      mobile,
      dob,
      sessionId,
      city,
      pincode,
      course,
      collegeId,
      picture,
    } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.json({
        msg: "Email Already Exist",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create student
    const student = new Student({
      name,
      fatherName,
      email,
      gender,
      password: passwordHash,
      address,
      mobile,
      dob,
      sessionId,
      city,
      pincode,
      course,
      collegeId,
      picture,
    });

    await student.save();

    res.json({
      msg: "Student Registered Successfully",
      id: student._id,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Student Registration Failed",
    });
  }
});

// STUDENT LOGIN
routes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.json({
        msg: "Email Not Matched",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.json({
        msg: "Password Not Matched",
      });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login Successfully",
      token: token,
      role: "Student",
      id: student._id,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Student Login Failed",
    });
  }
});

// GET ALL STUDENTS
routes.get("/", async (req, res) => {
  try {
    const data = await Student.find()
      .populate("sessionId")
      .populate("collegeId")
      .select("-password");

    res.json({
      msg: "Students fetched successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Students not fetched",
    });
  }
});

// GET SINGLE STUDENT
routes.get("/:id", async (req, res) => {
  try {
    const data = await Student.findById(req.params.id)
      .populate("sessionId")
      .populate("collegeId")
      .select("-password");

    if (!data) {
      return res.json({
        msg: "Student not found",
      });
    }

    res.json({
      msg: "Student fetched successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Student not fetched",
    });
  }
});

// UPDATE STUDENT
routes.patch("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If password is being updated, hash it first
    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password,
        10
      );
    }

    const data = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!data) {
      return res.json({
        msg: "Student not found",
      });
    }

    res.json({
      msg: "Student Updated Successfully",
      data: data,
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Student Not Updated",
    });
  }
});

// DELETE STUDENT
routes.delete("/:id", async (req, res) => {
  try {
    const data = await Student.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.json({
        msg: "Student not found",
      });
    }

    res.json({
      msg: "Student Deleted Successfully",
    });
  } catch (er) {
    console.log(er);

    res.json({
      msg: "Student not deleted",
    });
  }
});

module.exports = routes;