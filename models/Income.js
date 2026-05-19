const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  externalId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  date: {
    type: Date,
    required: [true, "Tarix tələb olunur"],
  },
  amount: {
    type: Number,
    required: [true, "Məbləğ tələb olunur"],
    min: [0, "Məbləğ mənfi ola bilməz"],
  },
  currency: {
    type: String,
    required: [true, "Valyuta tələb olunur"],
    enum: ["AZN", "USD", "EUR", "TRY", "RUB"],
    default: "AZN",
  },
  buyer: {
    type: String,
    required: [true, "Alıcı tələb olunur"],
    trim: true,
  },
  seller: {
    type: String,
    required: [true, "Satıcı tələb olunur"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index-lər
incomeSchema.index({ date: -1 });
incomeSchema.index({ buyer: "text", seller: "text" });
incomeSchema.index({ externalId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Income", incomeSchema);
