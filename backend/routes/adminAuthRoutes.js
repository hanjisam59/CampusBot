const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const router = express.Router();

// Register Admin
router.post("/register", async (req, res) => {
  try {
    const fullName = (req.body.fullName || '').trim();
    const staffIdInput = (req.body.staffId || '').trim().toUpperCase();
    const email = (req.body.email || '').trim().toLowerCase();
    const department = (req.body.department || '').trim();
    const password = (req.body.password || '').trim();

    const existingByEmail = await Admin.findOne({ email });
    if (existingByEmail) return res.status(400).json({ msg: "Email already registered" });

    const existingByStaff = await Admin.findOne({ staffId: staffIdInput });
    if (existingByStaff) return res.status(400).json({ msg: "Staff ID already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      fullName,
      staffId: staffIdInput,
      email,
      department,
      password: hashedPassword,
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      msg: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        department: admin.department,
        staffId: admin.staffId,
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

// Login Admin
router.post("/login", async (req, res) => {
  try {
    const staffId = (req.body.staffId || '').trim().toUpperCase();
    const password = (req.body.password || '').trim();

    const admin = await Admin.findOne({ staffId });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        department: admin.department,
        staffId: admin.staffId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


