const mongoose = require("mongoose");

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
    trim: true,
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

module.exports = mongoose.model("Employee", employeeSchema);
