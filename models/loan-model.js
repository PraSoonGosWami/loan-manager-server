const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * @description
 * Schema for Loan application's collection
 */
const loanSchema = new Schema({
  title: { type: String, required: true },
  applicantName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: String, required: true },
  installment: { type: String, required: true },
  fixed: { type: Boolean, required: true },
  verified: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now() },
  creator: { type: mongoose.Types.ObjectId, ref: "User" },
  adminComment: { type: String },
});

module.exports = mongoose.model("Loan", loanSchema);
