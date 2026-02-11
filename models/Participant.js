const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name_kh: { type: String, required: true },
  name_en: { type: String, required: true },
  gender: { type: String, required: true },
  high_school: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // ប្រើលេខទូរស័ព្ទជា Unique ID
  province: { type: String, required: true },
  address: String
}, { timestamps: true });

module.exports = mongoose.model('Participant', participantSchema);