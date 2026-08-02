const mongoose = require('mongoose')

const noticeSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['All', 'Events', 'Exams', 'Fees', 'Scholarships'], required: true },
  description: { type: String },
  pinned: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notice', noticeSchema)
