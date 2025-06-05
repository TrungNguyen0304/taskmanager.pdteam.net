const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔹 Tạo thư mục nếu chưa tồn tại
const uploadDir = 'uploads/reports';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔹 Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

// 🔹 Lọc định dạng file hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File không được hỗ trợ.'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
