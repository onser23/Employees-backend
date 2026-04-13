const nodemailer = require("nodemailer");

// Email konfiqurasiyası
const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "smtp@goldresidence.az",
    pass: process.env.EMAIL_PASS || "8Wpdv5ey4dJCCc96jWPx",
  },
});

// Admin email ünvanı (bildirişlər bura gedəcək)
const ADMIN_EMAIL = "samadsada.de@gmail.com";

// Doğum günü bildirişi göndər (yalnız adminə)
const sendBirthdayNotification = async (birthdayEmployee, allEmployees) => {
  console.log("SSSSSSSSSS", allEmployees);
  // Bugünün tarixini formatla
  const today = new Date();
  const formattedDate = today.toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Doğum günü olan işçinin yaşı
  const birthDate = new Date(birthdayEmployee.birthDate);
  const age = today.getFullYear() - birthDate.getFullYear();

  // Bütün işçilərin siyahısı (CC üçün)
  const ccEmails = allEmployees
    .filter((emp) => emp.email !== birthdayEmployee.email)
    .map((emp) => emp.email)
    .join(", ");

  const mailOptions = {
    from: process.env.EMAIL_USER || "your-email@gmail.com",
    to: ADMIN_EMAIL, // Əsas alıcı: samadsada.de@gmail.com
    cc: ccEmails || undefined, // Digər işçilər CC-də (istəyə bağlı)
    subject: `🎉 Doğum Günü Bildirişi - ${formattedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .employee-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .employee-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .detail { color: #666; margin: 5px 0; font-size: 14px; }
          .detail strong { color: #333; }
          .age-badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }
          .celebration { font-size: 40px; text-align: center; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="celebration">🎂</div>
            <h1>Doğum Günü Bildirişi</h1>
            <p>${formattedDate}</p>
          </div>
          
          <div class="content">
            <p style="color: #555; font-size: 16px;">
              Bu gün şirkətimizin əməkdaşlarından birinin doğum günüdür:
            </p>
            
            <div class="employee-card">
              <div class="employee-name">
                ${birthdayEmployee.firstName} ${birthdayEmployee.lastName}
              </div>
              
              <div class="detail">
                <strong>Vəzifə:</strong> ${birthdayEmployee.position}
              </div>
              
              <div class="detail">
                <strong>Departament:</strong> ${birthdayEmployee.department}
              </div>
              
              <div class="detail">
                <strong>Doğum tarixi:</strong> ${birthDate.toLocaleDateString("az-AZ")}
              </div>
              
              <div class="detail">
                <strong>Email:</strong> ${birthdayEmployee.email}
              </div>
              
              <div class="age-badge">
                ${age} yaşını tamamlayır
              </div>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              Bu bildiriş avtomatik olaraq göndərilmişdir.
            </p>
          </div>
          
          <div class="footer">
            <p>© İşçi İdarəetmə Sistemi</p>
            <p>Bu email yalnız məlumatlandırma məqsədi daşıyır.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Doğum günü bildirişi göndərildi: ${ADMIN_EMAIL} (Əsas alıcı)`,
    );
    if (ccEmails) {
      console.log(`📎 CC: ${ccEmails.length} işçi`);
    }
    return true;
  } catch (error) {
    console.error("❌ Email göndərmə xətası:", error);
    return false;
  }
};

// Birdən çox işçinin doğum günü olanda (toplu bildiriş)
const sendBulkBirthdayNotification = async (
  birthdayEmployees,
  allEmployees,
) => {
  if (birthdayEmployees.length === 0) return;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // CC üçün bütün işçilər
  const ccEmails = allEmployees.map((emp) => emp.email).join(", ");

  // Hər bir işçi üçün cədvəl sətirləri
  const employeeRows = birthdayEmployees
    .map((emp) => {
      const birthDate = new Date(emp.birthDate);
      const age = today.getFullYear() - birthDate.getFullYear();

      return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; font-weight: bold;">${emp.firstName} ${emp.lastName}</td>
        <td style="padding: 12px; color: #666;">${emp.position}</td>
        <td style="padding: 12px; color: #666;">${emp.department}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
            ${age} yaş
          </span>
        </td>
      </tr>
    `;
    })
    .join("");

  const mailOptions = {
    from: process.env.EMAIL_USER || "your-email@gmail.com",
    to: ADMIN_EMAIL, // Yalnız adminə
    cc: ccEmails || undefined,
    subject: `🎉 ${birthdayEmployees.length} İşçinin Doğum Günü - ${formattedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #ddd; }
          td { padding: 12px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎂 Bu gün ${birthdayEmployees.length} işçinin doğum günüdür!</h1>
            <p>${formattedDate}</p>
          </div>
          
          <div style="padding: 30px;">
            <table>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Vəzifə</th>
                  <th>Departament</th>
                  <th style="text-align: center;">Yaş</th>
                </tr>
              </thead>
              <tbody>
                ${employeeRows}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Bu bildiriş avtomatik olaraq göndərilmişdir.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Toplu doğum günü bildirişi göndərildi: ${ADMIN_EMAIL}`);
    return true;
  } catch (error) {
    console.error("❌ Email göndərmə xətası:", error);
    return false;
  }
};

module.exports = {
  sendBirthdayNotification,
  sendBulkBirthdayNotification,
  ADMIN_EMAIL,
};
