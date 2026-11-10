const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage if uploading to Cloudinary, or disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanExt = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + cleanExt);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only image and document files (PDF/DOC) are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: fileFilter
});

// Helper to handle Cloudinary or local URL
const processUploadedFile = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'gauaashray',
        resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw'
      });
      // Remove temp local file
      fs.unlink(file.path, () => {});
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error, falling back to local file:', err.message);
      return `/uploads/${file.filename}`;
    }
  }

  // Local URL fallback
  return `/uploads/${file.filename}`;
};

module.exports = {
  upload,
  processUploadedFile
};

