const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const employeeRoutes = require("./routes/employees");
const initBirthdayCheck = require("./jobs/birthdayCheck");
const authRoutes = require("./routes/auth");
// sonradan
const cors = require("cors");

// Environment variables
dotenv.config();

// Database connection
connectDB();

const app = express();

// Middleware
// app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "https://employees-frontend-ecru.vercel.app",
  }),
);

app.options("*", cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server işləyir" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Daxili server xətası",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir`);

  // Doğum günü yoxlanışını başlat
  initBirthdayCheck();
});
