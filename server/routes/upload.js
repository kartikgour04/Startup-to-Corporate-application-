// upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // In production, upload to Cloudinary
    // const result = await cloudinary.uploader.upload(req.file.path);
    // res.json({ url: result.secure_url });
    res.json({ url: `https://picsum.photos/seed/${Date.now()}/400/400`, message: 'Demo URL - configure Cloudinary for production' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/document', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: '#', filename: req.file.originalname, message: 'Demo - configure Cloudinary for production' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
