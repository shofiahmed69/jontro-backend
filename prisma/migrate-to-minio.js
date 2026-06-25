const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// MinIO Configuration
const s3 = new S3Client({
    endpoint: 'http://144.79.249.162:9000',
    region: 'us-east-1',
    credentials: {
        accessKeyId: '8922aafdca5f5e996e60a920',
        secretAccessKey: '26328691fcb53b5f033f128e9176beb5dee452024cc7f699',
    },
    forcePathStyle: true,
});

const BUCKET_NAME = 'jontro-uploads';
const UPLOADS_DIR = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../uploads');
const PUBLIC_URL_BASE = `http://144.79.249.162:9000/${BUCKET_NAME}`;

function getFiles(dir, files_ = []) {
    if (!fs.existsSync(dir)) return files_;
    const files = fs.readdirSync(dir);
    for (const val of files) {
        const name = path.join(dir, val);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.pdf') return 'application/pdf';
    return 'application/octet-stream';
}

async function uploadToMinio(filePath, relativeKey) {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);

    console.log(`📤 Uploading ${relativeKey} to MinIO (${contentType})...`);

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: relativeKey,
        Body: fileBuffer,
        ContentType: contentType,
    });

    await s3.send(command);
    const publicUrl = `${PUBLIC_URL_BASE}/${relativeKey}`;
    console.log(`✅ Uploaded. Public URL: ${publicUrl}`);
    return publicUrl;
}

async function main() {
    console.log('🚀 Starting MinIO upload and database sync...');
    console.log(`Scanning uploads directory: ${UPLOADS_DIR}`);

    const files = getFiles(UPLOADS_DIR);
    console.log(`Found ${files.length} files to migrate.`);

    const migrationMapping = {};

    for (const file of files) {
        const relativeKey = path.relative(UPLOADS_DIR, file);
        try {
            const publicUrl = await uploadToMinio(file, relativeKey);
            // Both local path and relative path could match, store mapping
            migrationMapping[relativeKey] = publicUrl;
            // Also store variations like starting with slash
            migrationMapping[`/uploads/${relativeKey}`] = publicUrl;
            migrationMapping[`uploads/${relativeKey}`] = publicUrl;
        } catch (err) {
            console.error(`❌ Failed to upload ${relativeKey}:`, err.message);
        }
    }

    console.log('🔄 Syncing URLs in Database...');

    // 1. Projects
    const projects = await prisma.project.findMany();
    for (const p of projects) {
        let updated = false;
        let thumbnail = p.thumbnail;
        
        for (const [key, val] of Object.entries(migrationMapping)) {
            if (thumbnail && thumbnail.includes(key)) {
                thumbnail = val;
                updated = true;
            }
        }

        if (updated) {
            await prisma.project.update({
                where: { id: p.id },
                data: { thumbnail }
            });
            console.log(`  Updated Project: ${p.title} -> ${thumbnail}`);
        }
    }

    // 2. TeamMembers
    const members = await prisma.teamMember.findMany();
    for (const m of members) {
        let updated = false;
        let avatar = m.avatar;

        for (const [key, val] of Object.entries(migrationMapping)) {
            if (avatar && avatar.includes(key)) {
                avatar = val;
                updated = true;
            }
        }

        if (updated) {
            await prisma.teamMember.update({
                where: { id: m.id },
                data: { avatar }
            });
            console.log(`  Updated TeamMember: ${m.name} -> ${avatar}`);
        }
    }

    // 3. Services
    const services = await prisma.service.findMany();
    for (const s of services) {
        let updated = false;
        let image = s.image;
        let banner = s.banner;

        for (const [key, val] of Object.entries(migrationMapping)) {
            if (image && image.includes(key)) {
                image = val;
                updated = true;
            }
            if (banner && banner.includes(key)) {
                banner = val;
                updated = true;
            }
        }

        if (updated) {
            await prisma.service.update({
                where: { id: s.id },
                data: { image, banner }
            });
            console.log(`  Updated Service: ${s.title}`);
        }
    }

    // 4. Testimonials
    const testimonials = await prisma.testimonial.findMany();
    for (const t of testimonials) {
        let updated = false;
        let avatar = t.avatar;

        for (const [key, val] of Object.entries(migrationMapping)) {
            if (avatar && avatar.includes(key)) {
                avatar = val;
                updated = true;
            }
        }

        if (updated) {
            await prisma.testimonial.update({
                where: { id: t.id },
                data: { avatar }
            });
            console.log(`  Updated Testimonial: ${t.name}`);
        }
    }

    console.log('🎉 Migration completed successfully!');
}

main()
    .catch(err => {
        console.error('Migration failed:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
