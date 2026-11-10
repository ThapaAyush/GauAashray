const express = require('express');
const router = express.Router();
const { upload, processUploadedFile } = require('../middleware/upload');

// @desc Upload Single File (image or document)
// @route POST /api/upload
router.post(
  '/',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }

      const fileUrl = await processUploadedFile(req.file);

      res.status(200).json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload route error:', error);
      res.status(500).json({ success: false, message: 'File upload failed' });
    }
  }
);

// @desc Upload Multiple Files
// @route POST /api/upload/multiple
router.post(
  '/multiple',
  (req, res, next) => {
    upload.array('files', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Files upload error' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files provided' });
      }

      const urls = await Promise.all(req.files.map((f) => processUploadedFile(f)));

      res.status(200).json({
        success: true,
        urls
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Files upload failed' });
    }
  }
);

module.exports = router;

