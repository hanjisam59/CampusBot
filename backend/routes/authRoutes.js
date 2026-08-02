const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/studentModel");
const auth = require("../middlewears/authMiddlewear");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, enrollmentNo, email, course, password } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      fullName,
      enrollmentNo,
      email,
      course,
      password: hashedPassword
    });

    await student.save();

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      msg: "Student registered successfully",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        enrollmentNo: student.enrollmentNo,
        email: student.email,
        course: student.course,
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const fields = Object.keys(error.keyPattern || {});
      const fieldList = fields.length ? fields.join(", ") : "unique field";
      return res.status(400).json({ msg: `Duplicate ${fieldList}. Please use a different value.` });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "1h" }
    );

    res.json({ token, student: { id: student._id, fullName: student.fullName, enrollmentNo: student.enrollmentNo, email: student.email, course: student.course } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current student profile
router.get("/me", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student).select("-password");
    if (!student) return res.status(404).json({ msg: "Student not found" });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
