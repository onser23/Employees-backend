const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { generateToken } = require("../config/jwt");

// İşçi Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasiya
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email və şifrə tələb olunur",
      });
    }

    // İşçini tap (şifrəni də gətir)
    const employee = await Employee.findOne({ email }).select("+password");
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Email və ya şifrə yanlışdır",
      });
    }

    // Şifrəni yoxla
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email və ya şifrə yanlışdır",
      });
    }

    // Token yarat
    const token = generateToken({
      id: employee._id,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: "employee",
    });

    res.json({
      success: true,
      message: "Xoş gəlmisiniz!",
      token,
      user: {
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message,
    });
  }
});

// Mövcud işçini yoxla (token ilə)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ success: false, user: null });
    }

    const token = authHeader.split(" ")[1];
    const { verifyToken } = require("../config/jwt");
    const decoded = verifyToken(token);

    const employee = await Employee.findById(decoded.id);

    if (!employee) {
      return res.json({ success: false, user: null });
    }

    res.json({
      success: true,
      user: {
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
        birthDate: employee.birthDate,
      },
    });
  } catch (error) {
    res.json({ success: false, user: null });
  }
});

module.exports = router;
