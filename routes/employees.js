const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/auth");

// Bütün routelara auth tələb et
router.use(authMiddleware);

// Bütün işçiləri gətir
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message,
    });
  }
});

// Tək işçini gətir
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "İşçi tapılmadı",
      });
    }
    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message,
    });
  }
});

// Yeni işçi əlavə et (password ilə)
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      position,
      department,
      email,
      password,
    } = req.body;

    // Email unikallığını yoxla
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Bu email ilə işçi artıq mövcuddur",
      });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      birthDate,
      position,
      department,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "İşçi uğurla əlavə edildi",
      data: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "İşçi əlavə edilərkən xəta",
      error: error.message,
    });
  }
});

// İşçini yenilə
router.put("/:id", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      position,
      department,
      email,
      password,
    } = req.body;

    const updateData = {
      firstName,
      lastName,
      birthDate,
      position,
      department,
      email,
    };

    // Əgər şifrə göndərilibsə, onu da yenilə
    if (password && password.length >= 6) {
      updateData.password = password;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "İşçi tapılmadı",
      });
    }

    res.json({
      success: true,
      message: "İşçi uğurla yeniləndi",
      data: employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "İşçi yenilənərkən xəta",
      error: error.message,
    });
  }
});

// İşçini sil
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "İşçi tapılmadı",
      });
    }

    res.json({
      success: true,
      message: "İşçi uğurla silindi",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "İşçi silinərkən xəta",
      error: error.message,
    });
  }
});

module.exports = router;
