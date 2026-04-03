const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');
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

// PUBLIC - get all published projects
router.get('/', async (req, res) => {
    try {
        const { category, featured } = req.query;
        const where = { published: true };
        if (featured === 'true') where.featured = true;
        if (category) where.category = { has: category };

        const projects = await prisma.project.findMany({
            where,
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('Projects error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUBLIC - get featured projects for home page
router.get('/featured', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { published: true, featured: true },
            orderBy: { order: 'asc' },
            take: 3
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUBLIC - get single project by slug
router.get('/:slug', async (req, res) => {
    try {
        // Skip admin routes
        if (req.params.slug === 'admin' || req.params.slug === 'upload-image') {
            return next();
        }
        const project = await prisma.project.findUnique({
            where: { slug: req.params.slug }
        });
        if (!project) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADMIN - get all projects including unpublished
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADMIN - upload project image
router.post('/upload-image',
    authMiddleware,
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'No image provided'
                });
            }

            const fileName = `projects/${Date.now()}-${req.file.originalname.replace(/\s/g, '-')}`;

            const { error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET || 'jontro-uploads')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (error) throw error;

            const { data } = supabase.storage
                .from(process.env.SUPABASE_BUCKET || 'jontro-uploads')
                .getPublicUrl(fileName);

            console.log('Image uploaded:', data.publicUrl);

            res.json({
                success: true,
                url: data.publicUrl
            });
        } catch (error) {
            console.error('Image upload error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// ADMIN - create project
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            title, slug, client, thumbnail,
            category, challenge, approach,
            features, techStack, results,
            featured, published, order
        } = req.body;

        const project = await prisma.project.create({
            data: {
                title,
                slug: slug || title.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, ''),
                client: client || '',
                thumbnail: thumbnail || '',
                category: Array.isArray(category)
                    ? category
                    : (category || '').split(',').map(c => c.trim()).filter(Boolean),
                challenge: challenge || '',
                approach: approach || '',
                features: Array.isArray(features)
                    ? features
                    : (features || '').split('\n').filter(Boolean),
                techStack: Array.isArray(techStack)
                    ? techStack
                    : (techStack || '').split(',').map(t => t.trim()).filter(Boolean),
                results: results || '',
                featured: featured === true || featured === 'true',
                published: published === true || published === 'true',
                order: parseInt(order) || 0
            }
        });

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ADMIN - update project
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const {
            title, slug, client, thumbnail,
            category, challenge, approach,
            features, techStack, results,
            featured, published, order
        } = req.body;

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(slug !== undefined ? { slug } : {}),
                ...(client !== undefined ? { client } : {}),
                ...(thumbnail !== undefined ? { thumbnail } : {}),
                ...(category !== undefined
                    ? {
                        category: Array.isArray(category)
                            ? category
                            : (category || '').split(',').map(c => c.trim()).filter(Boolean)
                    }
                    : {}),
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
                            : (techStack || '').split(',').map(t => t.trim()).filter(Boolean)
                    }
                    : {}),
                ...(results !== undefined ? { results } : {}),
                ...(featured !== undefined ? { featured: featured === true || featured === 'true' } : {}),
                ...(published !== undefined ? { published: published === true || published === 'true' } : {}),
                ...(order !== undefined ? { order: parseInt(order) || 0 } : {}),
            }
        });
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADMIN - toggle published
router.patch('/:id/publish', authMiddleware,
    async (req, res) => {
        try {
            const project = await prisma.project.findUnique({
                where: { id: req.params.id }
            });
            const updated = await prisma.project.update({
                where: { id: req.params.id },
                data: { published: !project.published }
            });
            res.json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// ADMIN - toggle featured
router.patch('/:id/featured', authMiddleware,
    async (req, res) => {
        try {
            const project = await prisma.project.findUnique({
                where: { id: req.params.id }
            });
            const updated = await prisma.project.update({
                where: { id: req.params.id },
                data: { featured: !project.featured }
            });
            res.json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

// ADMIN - delete project
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.project.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
