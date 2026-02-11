const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  participantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Participant', // ភ្ជាប់ទៅកាន់ Table Participant
    required: true ,
    index: true // បន្ថែមអាហ្នឹងមួយទៀតបង ឱ្យវាដើរលឿនដូចហោះ!
  },
  checkInTime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);