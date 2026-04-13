const cron = require("node-cron");
const moment = require("moment-timezone");
const Employee = require("../models/Employee");
const {
  sendBirthdayNotification,
  sendBulkBirthdayNotification,
} = require("../services/emailService");

const initBirthdayCheck = () => {
  console.log(
    "⏰ Doğum günü yoxlanışı aktiv edildi (hər gün 09:00 AZ vaxtı ilə)",
  );
  console.log("📧 Bildirişlər gedəcək: samadsada.de@gmail.com");

  cron.schedule(
    "* * * * *",
    async () => {
      // cron.schedule(
      //   "0 9 * * *",
      //   async () => {
      console.log("✅ Doğum günü yoxlanışı başladı...", new Date().toString());

      try {
        // Azərbaycan vaxtı ilə
        const today = moment().tz("Asia/Baku");
        const currentMonth = today.month() + 1;
        const currentDay = today.date();

        console.log(`📆 Bugün: ${currentDay}.${currentMonth} (AZ vaxtı)`);

        const employees = await Employee.find();
        console.log(`👥 Ümumi işçi sayı: ${employees.length}`);

        // Doğum günü olan işçiləri tap
        const birthdayEmployees = employees.filter((emp) => {
          const birthDate = moment(emp.birthDate);
          return (
            birthDate.month() + 1 === currentMonth &&
            birthDate.date() === currentDay
          );
        });

        console.log(
          `🎂 Doğum günü olan işçi sayı: ${birthdayEmployees.length}`,
        );

        if (birthdayEmployees.length === 0) {
          console.log("ℹ️ Bu gün heç kimin doğum günü deyil");
          return;
        }

        // Bütün işçilərin email-ləri (CC üçün)
        const allEmployees = await Employee.find();

        // 1 nəfərdirsə tək bildiriş, çoxdursa toplu bildiriş
        if (birthdayEmployees.length === 1) {
          await sendBirthdayNotification(birthdayEmployees[0], allEmployees);
        } else {
          await sendBulkBirthdayNotification(birthdayEmployees, allEmployees);
        }
      } catch (error) {
        console.error("❌ Doğum günü yoxlanışı xətası:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Baku",
    },
  );
};

module.exports = initBirthdayCheck;
