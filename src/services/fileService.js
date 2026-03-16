const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

async function uploadFile(fileBuffer, fileName, mimeType, folder = 'uploads') {
    const path = `${folder}/${Date.now()}-${fileName}`;
    const { error } = await supabase.storage
        .from(env.SUPABASE_BUCKET)
        .upload(path, fileBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Failed to upload file');
    }

    const { data } = supabase.storage
        .from(env.SUPABASE_BUCKET)
        .getPublicUrl(path);

    return data.publicUrl;
}

async function uploadResume(fileBuffer, fileName, mimeType) {
    return uploadFile(fileBuffer, fileName, mimeType, 'resumes');
}

async function uploadImage(fileBuffer, fileName, mimeType) {
    return uploadFile(fileBuffer, fileName, mimeType, 'images');
}

module.exports = { uploadResume, uploadImage };
