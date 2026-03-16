const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { generateSlug } = require('../services/slugService');

const router = express.Router();

const projectSchema = z.object({
    title: z.string().min(3),
    slug: z.string().optional(),
    client: z.string(),
    thumbnail: z.string().url(),
    category: z.array(z.string()),
    challenge: z.string(),
    approach: z.string(),
    features: z.array(z.string()),
    techStack: z.array(z.string()),
    results: z.string().optional(),
    testimonialId: z.string().uuid().optional(),
    featured: z.boolean().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
});

// Public: List projects
router.get('/', async (req, res, next) => {
    try {
        const { category, featured } = req.query;
        const where = { published: true };
        if (category) where.category = { has: category };
        if (featured === 'true') where.featured = true;

        const projects = await prisma.project.findMany({
            where,
            orderBy: { order: 'asc' },
            include: { testimonial: true }
        });
        res.json(projects);
    } catch (error) {
        next(error);
    }
});

// Admin: List all projects (with pagination)
router.get('/admin', auth, async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.project.count()
        ]);

        res.json({
            projects,
            totalPages: Math.ceil(total / take),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        next(error);
    }
});

// Public: Get project by slug
router.get('/:slug', async (req, res, next) => {
    try {
        const project = await prisma.project.findUnique({
            where: { slug: req.params.slug, published: true },
            include: { testimonial: true }
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.post('/', auth, validate(projectSchema), async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (!data.slug) data.slug = generateSlug(data.title);
        const project = await prisma.project.create({ data });
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(projectSchema), async (req, res, next) => {
    try {
        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(project);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
