const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { uploadImage } = require('../services/fileService');

const router = express.Router();
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit for images

router.post('/image', auth, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image is required' });

        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
        res.status(201).json({ url: imageUrl });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
