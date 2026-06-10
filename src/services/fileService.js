const fs = require('fs');
const path = require('path');
const env = require('../config/env');

// Use /app/uploads in production, local fallback in dev
const UPLOADS_DIR = env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../../uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function uploadFile(fileBuffer, fileName, mimeType, folder = 'uploads') {
    const folderPath = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(folderPath, safeFileName);

    try {
        fs.writeFileSync(filePath, fileBuffer);
        
        // Build public URL using BACKEND_URL env or request fallback
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4005';
        return `${backendUrl}/uploads/${folder}/${safeFileName}`;
    } catch (err) {
        console.error('File write error:', err);
        throw new Error('Failed to upload file to local storage');
    }
}

async function uploadResume(fileBuffer, fileName, mimeType) {
    return uploadFile(fileBuffer, fileName, mimeType, 'resumes');
}

async function uploadImage(fileBuffer, fileName, mimeType) {
    return uploadFile(fileBuffer, fileName, mimeType, 'images');
}

module.exports = { uploadResume, uploadImage };
