const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Bütün işçiləri gətir
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
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
    const employee = await Employee.findById(req.params.id);
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

// Yeni işçi əlavə et
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, birthDate, position, department, email } =
      req.body;

    const employee = await Employee.create({
      firstName,
      lastName,
      birthDate,
      position,
      department,
      email,
    });

    res.status(201).json({
      success: true,
      message: "İşçi uğurla əlavə edildi",
      data: employee,
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
    const { firstName, lastName, birthDate, position, department, email } =
      req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, birthDate, position, department, email },
      { new: true, runValidators: true },
    );

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
