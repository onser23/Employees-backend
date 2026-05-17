const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Ad tələb olunur"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Soyad tələb olunur"],
    trim: true,
  },
  birthDate: {
    type: Date,
    required: [true, "Doğum tarixi tələb olunur"],
  },
  position: {
    type: String,
    required: [true, "Vəzifə tələb olunur"],
    trim: true,
  },
  department: {
    type: String,
    required: [true, "Departament tələb olunur"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email tələb olunur"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Şifrə tələb olunur"],
    minlength: [6, "Şifrə ən az 6 simvol olmalıdır"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for full name
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ✅ HOOK 1: Yeni document yaratdıqda (create/save)
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ HOOK 2: findOneAndUpdate (findByIdAndUpdate daxil) edəndə
employeeSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  // Əgər şifrə yenilənirsə
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  next();
});

// ✅ HOOK 3: updateOne edəndə
employeeSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  next();
});

// Şifrəni müqayisə et metodu
employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
