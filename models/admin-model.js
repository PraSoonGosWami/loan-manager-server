const mongoose = require("mongoose");

const Schema = mongoose.Schema;
/**
 * @description
 * Schema for Admin' collection
 */
const adminSchema = new Schema({
  email: { type: String, required: true },
});
module.exports = mongoose.model("Admin", adminSchema);
