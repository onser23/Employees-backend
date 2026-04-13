const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const { generateToken } = require("../config/jwt");

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasiya
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi adı və şifrə tələb olunur",
      });
    }

    // Admin-i tap
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "İstifadəçi adı və ya şifrə yanlışdır",
      });
    }

    // Şifrəni yoxla
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "İstifadəçi adı və ya şifrə yanlışdır",
      });
    }

    // Token yarat
    const token = generateToken({
      id: admin._id,
      username: admin.username,
    });

    res.json({
      success: true,
      message: "Uğurla daxil oldunuz",
      token,
      user: {
        id: admin._id,
        username: admin.username,
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

// Register (ilk admin yaratmaq üçün - təhlükəsizlikdə sonra silinə bilər)
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Yoxla görə bu istifadəçi adı varmı
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Bu istifadəçi adı artıq mövcuddur",
      });
    }

    // Yeni admin yarat
    const admin = await Admin.create({ username, password });

    const token = generateToken({
      id: admin._id,
      username: admin.username,
    });

    res.status(201).json({
      success: true,
      message: "Admin uğurla yaradıldı",
      token,
      user: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Qeydiyyat xətası",
      error: error.message,
    });
  }
});

// Mövcud user-i yoxla (token ilə)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ success: false, user: null });
    }

    const token = authHeader.split(" ")[1];
    const { verifyToken } = require("../config/jwt");
    const decoded = verifyToken(token);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.json({ success: false, user: null });
    }

    res.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.json({ success: false, user: null });
  }
});

module.exports = router;
