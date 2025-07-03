const express = require('express');
const Word = require('../models/Word');
const WordSet = require('../models/WordSet');
const auth = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả từ, có thể filter theo wordSet
router.get('/', auth, async (req, res) => {
  try {
    // Tìm tất cả bộ từ mặc định
    const defaultSets = await WordSet.find({ isDefault: true });
    const defaultSetIds = defaultSets.map(set => set._id);

    const filter = {
      $or: [
        { owner: req.user.userId }, // Từ của user
        { wordSet: { $in: defaultSetIds } } // Từ trong các bộ từ mặc định
      ]
    };
    
    // Nếu có wordSet, kiểm tra xem có phải bộ từ mặc định không
    if (req.query.wordSet) {
      const wordSet = await WordSet.findById(req.query.wordSet);
      if (wordSet && wordSet.isDefault) {
        // Nếu là bộ từ mặc định, lấy tất cả từ của bộ đó
        filter.wordSet = req.query.wordSet;
      } else {
        // Nếu không phải bộ từ mặc định, chỉ lấy từ của user
        filter.$or = [{ owner: req.user.userId, wordSet: req.query.wordSet }];
      }
    }

    console.log('Fetching words with filter:', filter);
    const words = await Word.find(filter).populate('wordSet');
    console.log(`Found ${words.length} words`);
    res.json(words);
  } catch (err) {
    console.error('Error fetching words:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Thêm từ mới (hỗ trợ thêm 1 hoặc nhiều từ)
router.post('/', auth, async (req, res) => {
  try {
    let wordsToAdd = Array.isArray(req.body) ? req.body : [req.body];
    
    // Kiểm tra xem có từ nào thuộc bộ từ mặc định không
    const wordSets = await WordSet.find({
      _id: { $in: [...new Set(wordsToAdd.map(w => w.wordSet))] }
    });
    const defaultSets = new Set(wordSets.filter(ws => ws.isDefault).map(ws => ws._id.toString()));
    
    if (defaultSets.size > 0) {
      return res.status(403).json({ message: 'Không thể thêm từ vào bộ từ mặc định' });
    }
    
    // Gán owner là user đang đăng nhập
    wordsToAdd = wordsToAdd.map(w => ({ ...w, owner: req.user.userId }));
    
    // Lọc các từ đã tồn tại (trùng english + wordSet + owner)
    const existing = await Word.find({
      $or: wordsToAdd.map(w => ({ english: w.english, wordSet: w.wordSet, owner: req.user.userId }))
    });
    
    const existingSet = new Set(existing.map(w => w.english + '|' + w.wordSet));
    const filtered = wordsToAdd.filter(w => !existingSet.has(w.english + '|' + w.wordSet));
    
    if (filtered.length === 0) {
      return res.status(200).json({ added: [], duplicated: wordsToAdd });
    }
    const added = await Word.insertMany(filtered);
    
    res.status(201).json({ added, duplicated: wordsToAdd.filter(w => !filtered.includes(w)) });
  } catch (err) {
    console.error('Error adding words:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Sửa từ
router.put('/:id', auth, async (req, res) => {
  try {
    // Kiểm tra xem từ có thuộc bộ từ mặc định không
    const word = await Word.findById(req.params.id).populate('wordSet');
    if (!word) return res.status(404).json({ message: 'Không tìm thấy từ' });
    if (word.wordSet.isDefault) return res.status(403).json({ message: 'Không thể sửa từ trong bộ từ mặc định' });

    const { english, phonetic, type, vietnamese, wordSet } = req.body;
    
    const updatedWord = await Word.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { english, phonetic, type, vietnamese, wordSet },
      { new: true }
    );
    if (!updatedWord) return res.status(404).json({ message: 'Không tìm thấy từ hoặc không có quyền' });
    res.json(updatedWord);
  } catch (err) {
    console.error('Error updating word:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa từ
router.delete('/:id', auth, async (req, res) => {
  try {
    // Kiểm tra xem từ có thuộc bộ từ mặc định không
    const word = await Word.findById(req.params.id).populate('wordSet');
    if (!word) return res.status(404).json({ message: 'Không tìm thấy từ' });
    if (word.wordSet.isDefault) return res.status(403).json({ message: 'Không thể xóa từ trong bộ từ mặc định' });

    const deletedWord = await Word.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!deletedWord) return res.status(404).json({ message: 'Không tìm thấy từ hoặc không có quyền' });
    res.json({ message: 'Đã xóa từ', word: deletedWord });
  } catch (err) {
    console.error('Error deleting word:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router; 