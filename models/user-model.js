const mongoose = require("mongoose");

const Schema = mongoose.Schema;
/**
 * @description
 * Schema for User's collection
 */
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  loans: [{ type: mongoose.Types.ObjectId, required: true, ref: "Loan" }],
  fcmToken: { type: String },
});
module.exports = mongoose.model("User", userSchema);
