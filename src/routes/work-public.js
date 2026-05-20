const router = require('express').Router();
const prisma = require('../services/db');

router.get('/', async (req, res, next) => {
    try {
        const { category, featured } = req.query;
        const where = { published: true };

        if (featured === 'true') {
            where.featured = true;
        }
        if (category) {
            where.category = { has: category };
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { order: 'asc' }
        });

        res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
});

router.get('/featured', async (req, res, next) => {
    try {
        const projects = await prisma.project.findMany({
            where: { published: true, featured: true },
            orderBy: { order: 'asc' },
            take: 3
        });

        res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                slug: req.params.slug,
                published: true
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Not found' });
        }

        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
