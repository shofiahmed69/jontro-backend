const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { generateSlug } = require('../services/slugService');

const router = express.Router();

const serviceSchema = z.object({
    title: z.string().min(2),
    slug: z.string().optional(),
    icon: z.string().optional(),
    description: z.string(),
    features: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    deliverables: z.array(z.string()).optional(),
    process: z.array(z.any()).optional(),
    useCases: z.array(z.string()).optional(),
    techStack: z.array(z.string()).optional(),
    pricingTiers: z.array(z.any()).optional(),
    faq: z.array(z.any()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
});

// Public: List services
router.get('/', async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            where: { published: true },
            orderBy: { order: 'asc' }
        });
        res.json(services);
    } catch (error) {
        next(error);
    }
});

// Public: Get service by slug
router.get('/:slug', async (req, res, next) => {
    try {
        const service = await prisma.service.findUnique({
            where: { slug: req.params.slug, published: true }
        });
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.post('/', auth, validate(serviceSchema), async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (!data.slug) data.slug = generateSlug(data.title);
        const service = await prisma.service.create({ data });
        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(serviceSchema), async (req, res, next) => {
    try {
        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(service);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.service.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
