const express = require('express');
const WordSet = require('../models/WordSet');
const auth = require('../middleware/auth');
const Word = require('../models/Word');

const router = express.Router();

// Lấy tất cả bộ từ của user (và bộ mặc định)
router.get('/', auth, async (req, res) => {
  try {
    const sets = await WordSet.find({ $or: [ { owner: req.user.userId }, { isDefault: true } ] });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Tạo bộ từ mới
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu tên bộ từ' });
    
    const exists = await WordSet.findOne({ name, owner: req.user.userId });
    if (exists) return res.status(409).json({ message: 'Bộ từ đã tồn tại' });
    
    const setData = { name, owner: req.user.userId, isDefault: false };
    const set = await WordSet.create(setData);
    
    res.status(201).json(set);
  } catch (err) {
    console.error('Error creating WordSet:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Đổi tên bộ từ
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu tên bộ từ' });

    // Kiểm tra xem có phải bộ từ mặc định không
    const wordSet = await WordSet.findById(req.params.id);
    if (!wordSet) return res.status(404).json({ message: 'Không tìm thấy bộ từ' });
    if (wordSet.isDefault) return res.status(403).json({ message: 'Không thể sửa bộ từ mặc định' });

    const set = await WordSet.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { name },
      { new: true }
    );
    if (!set) return res.status(404).json({ message: 'Không tìm thấy bộ từ hoặc không có quyền' });
    res.json(set);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa bộ từ
router.delete('/:id', auth, async (req, res) => {
  try {
    // Kiểm tra xem có phải bộ từ mặc định không
    const wordSet = await WordSet.findById(req.params.id);
    if (!wordSet) return res.status(404).json({ message: 'Không tìm thấy bộ từ' });
    if (wordSet.isDefault) return res.status(403).json({ message: 'Không thể xóa bộ từ mặc định' });

    const set = await WordSet.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!set) return res.status(404).json({ message: 'Không tìm thấy bộ từ hoặc không có quyền' });
    // Xóa toàn bộ từ thuộc bộ từ này
    await Word.deleteMany({ wordSet: set._id, owner: req.user.userId });
    res.json({ message: 'Đã xóa bộ từ và toàn bộ từ thuộc bộ này', set });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router; 