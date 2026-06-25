const express = require('express');
const router = express.Router();
const prisma = require('../services/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

// Base directory for uploads
const UPLOADS_DIR = env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../../uploads');

// Helper to download and save file
async function migrateFileUrl(url) {
    if (!url || !url.includes('supabase.co')) {
        return url; // Return unchanged
    }

    try {
        // Extract folder and file name from the Supabase URL
        // Example URL: https://zhfmyrumuagbkwxoyryc.supabase.co/storage/v1/object/public/jontro-uploads/resumes/1773614493692-Kazi_Shofi_Ahmed_CV.pdf
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        
        // Find folder and filename after 'jontro-uploads'
        const bucketIndex = pathParts.indexOf('jontro-uploads');
        if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
            console.warn(`Could not parse folder/file structure for URL: ${url}`);
            return url;
        }

        const folder = pathParts[bucketIndex + 1];
        const filename = pathParts.slice(bucketIndex + 2).join('/'); // In case of subdirectories
        
        const localFolder = path.join(UPLOADS_DIR, folder);
        if (!fs.existsSync(localFolder)) {
            fs.mkdirSync(localFolder, { recursive: true });
        }

        const localFilePath = path.join(localFolder, filename);

        // Download only if file doesn't already exist locally (idempotent)
        if (!fs.existsSync(localFilePath)) {
            console.log(`Downloading: ${url} -> ${localFilePath}`);
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream',
                timeout: 30000 // 30s timeout
            });

            const writer = fs.createWriteStream(localFilePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        }

        // Build new URL pointing to VPS backend
        const backendUrl = process.env.BACKEND_URL || 'http://av6hpxggddiskq0cjouic069.144.79.249.162.sslip.io';
        return `${backendUrl}/uploads/${folder}/${filename}`;
    } catch (err) {
        console.error(`Error migrating file URL ${url}:`, err.message);
        return url; // Keep original on error to not lose reference
    }
}

// Endpoint to run the migration
router.post('/run', async (req, res) => {
    // Basic password/token protection so random people can't trigger it
    const { token } = req.body;
    if (token !== 'migration-secret-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('Starting Supabase files migration...');
        const stats = {
            applications: 0,
            projects: 0,
            blogPosts: 0,
            services: 0,
            teamMembers: 0,
            testimonials: 0,
            errors: 0
        };

        // 1. Migrate JobApplications (resumeUrl) - SKIPPED AS PER USER REQUEST
        /*
        const apps = await prisma.jobApplication.findMany({
            where: { resumeUrl: { contains: 'supabase.co' } }
        });
        console.log(`Found ${apps.length} job applications with Supabase resumes.`);
        for (const app of apps) {
            const newUrl = await migrateFileUrl(app.resumeUrl);
            if (newUrl !== app.resumeUrl) {
                await prisma.jobApplication.update({
                    where: { id: app.id },
                    data: { resumeUrl: newUrl }
                });
                stats.applications++;
            } else if (app.resumeUrl.includes('supabase.co')) {
                stats.errors++;
            }
        }
        */


        // 2. Migrate Projects (thumbnail)
        const projects = await prisma.project.findMany({
            where: { thumbnail: { contains: 'supabase.co' } }
        });
        for (const project of projects) {
            const newUrl = await migrateFileUrl(project.thumbnail);
            if (newUrl !== project.thumbnail) {
                await prisma.project.update({
                    where: { id: project.id },
                    data: { thumbnail: newUrl }
                });
                stats.projects++;
            } else if (project.thumbnail.includes('supabase.co')) {
                stats.errors++;
            }
        }

        // 3. Migrate BlogPosts (heroImage)
        const blogs = await prisma.blogPost.findMany({
            where: { heroImage: { contains: 'supabase.co' } }
        });
        for (const blog of blogs) {
            const newUrl = await migrateFileUrl(blog.heroImage);
            if (newUrl !== blog.heroImage) {
                await prisma.blogPost.update({
                    where: { id: blog.id },
                    data: { heroImage: newUrl }
                });
                stats.blogPosts++;
            } else if (blog.heroImage.includes('supabase.co')) {
                stats.errors++;
            }
        }

        // 4. Migrate Services (image, banner, icon)
        const services = await prisma.service.findMany({});
        for (const service of services) {
            let updated = false;
            const updateData = {};

            if (service.image && service.image.includes('supabase.co')) {
                const newUrl = await migrateFileUrl(service.image);
                if (newUrl !== service.image) {
                    updateData.image = newUrl;
                    updated = true;
                }
            }
            if (service.banner && service.banner.includes('supabase.co')) {
                const newUrl = await migrateFileUrl(service.banner);
                if (newUrl !== service.banner) {
                    updateData.banner = newUrl;
                    updated = true;
                }
            }
            if (service.icon && service.icon.includes('supabase.co')) {
                const newUrl = await migrateFileUrl(service.icon);
                if (newUrl !== service.icon) {
                    updateData.icon = newUrl;
                    updated = true;
                }
            }

            if (updated) {
                await prisma.service.update({
                    where: { id: service.id },
                    data: updateData
                });
                stats.services++;
            }
        }

        // 5. Migrate TeamMembers (avatar)
        const members = await prisma.teamMember.findMany({
            where: { avatar: { contains: 'supabase.co' } }
        });
        for (const member of members) {
            const newUrl = await migrateFileUrl(member.avatar);
            if (newUrl !== member.avatar) {
                await prisma.teamMember.update({
                    where: { id: member.id },
                    data: { avatar: newUrl }
                });
                stats.teamMembers++;
            } else if (member.avatar.includes('supabase.co')) {
                stats.errors++;
            }
        }

        // 6. Migrate Testimonials (avatar)
        const testimonials = await prisma.testimonial.findMany({
            where: { avatar: { contains: 'supabase.co' } }
        });
        for (const testimonial of testimonials) {
            const newUrl = await migrateFileUrl(testimonial.avatar);
            if (newUrl !== testimonial.avatar) {
                await prisma.testimonial.update({
                    where: { id: testimonial.id },
                    data: { avatar: newUrl }
                });
                stats.testimonials++;
            } else if (testimonial.avatar.includes('supabase.co')) {
                stats.errors++;
            }
        }

        console.log('Migration finished!', stats);
        res.json({ message: 'Migration completed', stats });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to restore services from db-backup.json and migrate their images
router.post('/services', async (req, res) => {
    const { token } = req.body;
    if (token !== 'migration-secret-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        let servicesRecords = req.body.services || [];
        
        if (servicesRecords.length === 0) {
            const backupPath = path.join(__dirname, '../../prisma/db-backup.json');
            if (!fs.existsSync(backupPath)) {
                return res.status(404).json({ error: 'db-backup.json not found and no services provided in body' });
            }
            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            servicesRecords = backupData.Service || [];
        }

        if (servicesRecords.length === 0) {
            return res.status(400).json({ error: 'No Service records found to restore' });
        }


        console.log(`Cleaning Service table and restoring ${servicesRecords.length} records...`);
        await prisma.service.deleteMany();

        // Restore services
        await prisma.service.createMany({
            data: servicesRecords
        });

        // Now migrate their images and banners
        const services = await prisma.service.findMany({});
        let migratedCount = 0;

        for (const service of services) {
            let updated = false;
            const updateData = {};

            if (service.image && service.image.includes('supabase.co')) {
                const newUrl = await migrateFileUrl(service.image);
                if (newUrl !== service.image) {
                    updateData.image = newUrl;
                    updated = true;
                }
            }
            if (service.banner && service.banner.includes('supabase.co')) {
                const newUrl = await migrateFileUrl(service.banner);
                if (newUrl !== service.banner) {
                    updateData.banner = newUrl;
                    updated = true;
                }
            }

            if (updated) {
                await prisma.service.update({
                    where: { id: service.id },
                    data: updateData
                });
                migratedCount++;
            }
        }

        res.json({ message: 'Services restored and migrated successfully', count: servicesRecords.length, migratedImages: migratedCount });
    } catch (error) {
        console.error('Error restoring services:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

