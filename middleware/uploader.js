const multer = require('multer');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const isPdf = file.mimetype === 'application/pdf';
  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

module.exports = upload;
