const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
}).single('image');

module.exports = upload;