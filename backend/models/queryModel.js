const mongoose = require('mongoose')

const querySchema = new mongoose.Schema({
  question: { type: String, required: true },
  userEmail: { type: String },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  response: { type: String },
  published: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Query', querySchema)


