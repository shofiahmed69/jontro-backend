const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const statSchema = z.object({
    label: z.string(),
    value: z.string(),
    order: z.number().int().optional(),
});

// Public: List stats
router.get('/', async (req, res, next) => {
    try {
        const stats = await prisma.stat.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.post('/', auth, validate(statSchema), async (req, res, next) => {
    try {
        const stat = await prisma.stat.create({ data: req.body });
        res.status(201).json(stat);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(statSchema), async (req, res, next) => {
    try {
        const stat = await prisma.stat.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(stat);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.stat.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
