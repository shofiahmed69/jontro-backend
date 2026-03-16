const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { leadLimiter } = require('../middleware/rateLimiter');
const { sendLeadNotification, sendLeadConfirmation } = require('../services/emailService');

const router = express.Router();

const leadSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    company: z.string().max(100).optional(),
    country: z.string().max(60).optional(),
    service: z.string().max(100).optional(),
    budget: z.string().max(40).optional(),
    description: z.string().min(5).max(2000),
    referral: z.string().max(100).optional(),
});

// Public: Submit a lead
router.post('/', leadLimiter, validate(leadSchema), async (req, res, next) => {
    try {
        const lead = await prisma.lead.create({
            data: req.body
        });

        // Email notifications (async, don't block response)
        sendLeadNotification(lead).catch(console.error);
        sendLeadConfirmation(lead).catch(console.error);

        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
});

// Admin: List leads
router.get('/admin', auth, async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: order }
            }),
            prisma.lead.count({ where })
        ]);

        res.json({
            leads,
            totalPages: Math.ceil(total / take),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Update lead status
router.patch('/admin/:id', auth, async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: { status, notes }
        });
        res.json(lead);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
