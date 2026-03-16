const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const teamMemberSchema = z.object({
    name: z.string().min(2),
    role: z.string(),
    bio: z.string(),
    avatar: z.string().url().optional(),
    linkedIn: z.string().url().optional(),
    twitter: z.string().url().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
});

// Public: List team
router.get('/', async (req, res, next) => {
    try {
        const team = await prisma.teamMember.findMany({
            where: { published: true },
            orderBy: { order: 'asc' }
        });
        res.json(team);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.post('/', auth, validate(teamMemberSchema), async (req, res, next) => {
    try {
        const member = await prisma.teamMember.create({ data: req.body });
        res.status(201).json(member);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(teamMemberSchema), async (req, res, next) => {
    try {
        const member = await prisma.teamMember.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(member);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.teamMember.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
