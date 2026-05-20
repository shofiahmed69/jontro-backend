const router = require('express').Router();
const prisma = require('../services/db');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

router.get('/all', async (req, res, next) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
});

router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const fileName = `projects/${Date.now()}-${req.file.originalname.replace(/\s/g, '-')}`;
        const { error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'jontro-uploads')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) {
            return res.status(500).json({ error: 'Image upload failed' });
        }

        const { data } = supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'jontro-uploads')
            .getPublicUrl(fileName);

        res.json({ success: true, url: data.publicUrl });
    } catch (error) {
        res.status(500).json({ error: 'Image upload failed' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            title, slug, client, thumbnail,
            category, description, challenge, approach,
            features, techStack, results,
            featured, published, order, liveUrl, githubUrl
        } = req.body;

        const projectData = {
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            client: client || '',
            thumbnail: thumbnail || '',
            liveUrl: liveUrl || '',
            githubUrl: githubUrl || '',
            category: Array.isArray(category)
                ? category
                : (category || '').split(',').map((c) => c.trim()).filter(Boolean),
            description: description || '',
            challenge: challenge || '',
            approach: approach || '',
            features: Array.isArray(features)
                ? features
                : (features || '').split('\n').filter(Boolean),
            techStack: Array.isArray(techStack)
                ? techStack
                : (techStack || '').split(',').map((t) => t.trim()).filter(Boolean),
            results: results || '',
            featured: featured === true || featured === 'true',
            published: published === true || published === 'true',
            order: parseInt(order, 10) || 0
        };

        const project = await prisma.project.create({ data: projectData });
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const {
            title, slug, client, thumbnail,
            category, description, challenge, approach,
            features, techStack, results,
            featured, published, order, liveUrl, githubUrl
        } = req.body;

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(slug !== undefined ? { slug } : {}),
                ...(client !== undefined ? { client } : {}),
                ...(thumbnail !== undefined ? { thumbnail } : {}),
                ...(liveUrl !== undefined ? { liveUrl: liveUrl || '' } : {}),
                ...(githubUrl !== undefined ? { githubUrl: githubUrl || '' } : {}),
                ...(category !== undefined
                    ? {
                        category: Array.isArray(category)
                            ? category
                            : (category || '').split(',').map((c) => c.trim()).filter(Boolean)
                    }
                    : {}),
                ...(description !== undefined ? { description } : {}),
                ...(challenge !== undefined ? { challenge } : {}),
                ...(approach !== undefined ? { approach } : {}),
                ...(features !== undefined
                    ? {
                        features: Array.isArray(features)
                            ? features
                            : (features || '').split('\n').filter(Boolean)
                    }
                    : {}),
                ...(techStack !== undefined
                    ? {
                        techStack: Array.isArray(techStack)
                            ? techStack
                            : (techStack || '').split(',').map((t) => t.trim()).filter(Boolean)
                    }
                    : {}),
                ...(results !== undefined ? { results } : {}),
                ...(featured !== undefined ? { featured: featured === true || featured === 'true' } : {}),
                ...(published !== undefined ? { published: published === true || published === 'true' } : {}),
                ...(order !== undefined ? { order: parseInt(order, 10) || 0 } : {})
            }
        });

        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

router.patch('/:id/publish', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: { published: !project.published }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle publish' });
    }
});

router.patch('/:id/featured', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: { featured: !project.featured }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle featured' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
