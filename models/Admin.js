const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "İstifadəçi adı tələb olunur"],
    unique: true,
    trim: true,
    minlength: [3, "İstifadəçi adı ən az 3 simvol olmalıdır"],
  },
  password: {
    type: String,
    required: [true, "Şifrə tələb olunur"],
    minlength: [6, "Şifrə ən az 6 simvol olmalıdır"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Şifrəni hash et (yaratmadan əvvəl)
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Şifrəni müqayisə et metodu
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
