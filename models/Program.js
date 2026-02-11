const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  session: { type: String, enum: ['Morning', 'Evening', 'Session 1', 'Session 2'] },
  startTime: String,
  endTime: String,
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);