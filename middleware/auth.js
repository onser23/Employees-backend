const { verifyToken } = require("../config/jwt");

const authMiddleware = (req, res, next) => {
  try {
    // Header-dan token-i al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tapılmadı. Zəhmət olmasa daxil olun.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Token-i yoxla
    const decoded = verifyToken(token);

    // User məlumatını request-ə əlavə et
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token etibarsızdır və ya vaxtı keçib",
    });
  }
};

module.exports = authMiddleware;
