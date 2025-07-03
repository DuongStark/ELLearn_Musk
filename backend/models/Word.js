const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  english: { type: String, required: true },
  phonetic: { type: String },
  type: { type: String },
  vietnamese: { type: String, required: true },
  wordSet: { type: mongoose.Schema.Types.ObjectId, ref: 'WordSet', required: true }, // liên kết tới WordSet
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // user sở hữu, null là từ trong bộ mặc định
  remembered: { type: Boolean, default: false },
}, {
  timestamps: true // createdAt, updatedAt
});

module.exports = mongoose.model('Word', wordSchema); 