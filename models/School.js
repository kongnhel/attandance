// models/School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // ឈ្មោះសាលា
    telegramLink: { type: String, required: true }, // Link ចូល Group
    province: { type: String, required: true }, // ខេត្ត (សម្រាប់ដាក់ចូល Optgroup)
  },
  { timestamps: true },
);

module.exports = mongoose.model("School", schoolSchema);
