const mongoose = require('mongoose');

const wordSetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('WordSet', wordSetSchema, 'wordsets');