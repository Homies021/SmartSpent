const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  type: { type: String, enum: ["Income", "Expense"], required: true },
  amount: { type: Number, required: true },
  note: { type: String },
  category: { type: String, required: true },  // New field
  date: { type: Date, default: Date.now },     // New field
});

module.exports = mongoose.model("Transaction", transactionSchema);
