const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const testimonialSchema = z.object({
    name: z.string().min(2),
    role: z.string(),
    avatar: z.string().url().optional(),
    quote: z.string(),
    rating: z.number().int().min(1).max(5).optional(),
    published: z.boolean().optional(),
    order: z.number().int().optional(),
});

// Public: List testimonials
router.get('/', async (req, res, next) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { published: true },
            orderBy: { order: 'asc' }
        });
        res.json(testimonials);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.post('/', auth, validate(testimonialSchema), async (req, res, next) => {
    try {
        const testimonial = await prisma.testimonial.create({ data: req.body });
        res.status(201).json(testimonial);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(testimonialSchema), async (req, res, next) => {
    try {
        const testimonial = await prisma.testimonial.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(testimonial);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.testimonial.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
