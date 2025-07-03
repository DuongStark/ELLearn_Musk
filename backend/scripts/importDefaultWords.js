require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const WordSet = require('../models/WordSet');
const Word = require('../models/Word');

// Kết nối MongoDB với timeout dài hơn và thêm debug
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ellon-pwa';
console.log('Connecting to MongoDB at:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // tăng timeout lên 30 giây
  connectTimeoutMS: 30000,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  return importDefaultWords();
})
.catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

async function importDefaultWords() {
  try {
    console.log('Starting import process...');

    // Tạo WordSet mặc định
    console.log('Creating default word set...');
    const defaultWordSet = await WordSet.findOneAndUpdate(
      { isDefault: true },
      { 
        name: '3000 từ vựng cơ bản',
        isDefault: true,
        owner: null
      },
      { upsert: true, new: true }
    );

    console.log('Created default word set:', defaultWordSet);

    // Đọc file CSV
    console.log('Reading CSV file...');
    const csvPath = path.join(__dirname, '../../3000.csv');
    console.log('CSV path:', csvPath);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');
    console.log('Total lines in CSV:', lines.length);

    // Xóa các từ cũ trong bộ mặc định
    console.log('Deleting old words...');
    const deleteResult = await Word.deleteMany({ wordSet: defaultWordSet._id });
    console.log('Deleted old words:', deleteResult);

    // Import từng từ
    console.log('Starting to import words...');
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let line of lines) {
      try {
        // Bỏ qua dòng trống
        if (!line.trim()) {
          skippedCount++;
          continue;
        }
        
        const parts = line.split(';');
        // Kiểm tra đủ 4 phần
        if (parts.length < 4) {
          console.log('Skipping invalid line:', line);
          skippedCount++;
          continue;
        }

        const [english, type, phonetic, vietnamese] = parts;
        
        // Kiểm tra các trường bắt buộc
        if (!english.trim() || !vietnamese.trim()) {
          console.log('Skipping line with missing required fields:', line);
          skippedCount++;
          continue;
        }

        const word = await Word.create({
          english: english.trim(),
          type: type ? type.trim() : '',
          phonetic: phonetic ? phonetic.trim() : '',
          vietnamese: vietnamese.trim(),
          wordSet: defaultWordSet._id,
          owner: null,
        });
        
        importedCount++;
        if (importedCount % 100 === 0) {
          console.log(`Imported ${importedCount} words...`);
        }
      } catch (err) {
        console.error('Error importing line:', line, err);
        errorCount++;
      }
    }

    console.log(`
Import completed:
- Total words imported: ${importedCount}
- Skipped lines: ${skippedCount}
- Errors: ${errorCount}
    `);
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    // In ra stack trace đầy đủ
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
} 