const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

const createAdmin = async () => {
  try {
    await connectDB();

    const username = "admin";
    const password = "admin123";

    // Əvvəlki adminləri sil (optional)
    await Admin.deleteMany({});

    const admin = await Admin.create({
      username,
      password,
    });

    console.log("✅ Admin uğurla yaradıldı:");
    console.log(`   İstifadəçi adı: ${username}`);
    console.log(`   Şifrə: ${password}`);
    console.log("\n⚠️  PRODUKSIYADA BU ŞİFRƏNİ DƏYİŞİN!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Xəta:", error.message);
    process.exit(1);
  }
};

createAdmin();
