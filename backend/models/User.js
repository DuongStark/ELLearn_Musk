const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  // Có thể mở rộng thêm: name, avatar, ...
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 