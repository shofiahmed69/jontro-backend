const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const normalizeOptionalString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};

const normalizeOptionalUrl = (value) => {
    const normalized = normalizeOptionalString(value);
    if (typeof normalized !== 'string') return normalized;
    if (/^https?:\/\//i.test(normalized)) return normalized;
    return `https://${normalized}`;
};

const teamMemberSchema = z.object({
    name: z.string().trim().min(2),
    role: z.string().trim().min(1),
    department: z.preprocess(normalizeOptionalString, z.string().trim().optional()),
    teamId: z.preprocess(normalizeOptionalString, z.string().trim().optional()),
    bio: z.string().trim().min(1),
    avatar: z.preprocess(normalizeOptionalUrl, z.string().url().optional()),
    linkedIn: z.preprocess(normalizeOptionalUrl, z.string().url().optional()),
    twitter: z.preprocess(normalizeOptionalUrl, z.string().url().optional()),
    workEmail: z.preprocess(normalizeOptionalString, z.string().trim().email().optional()),
    employeePassword: z.preprocess(normalizeOptionalString, z.string().min(6).optional()),
    employeeActive: z.boolean().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
});

const adminTeamMemberSelect = {
    id: true,
    name: true,
    role: true,
    department: true,
    teamId: true,
    bio: true,
    avatar: true,
    linkedIn: true,
    twitter: true,
    workEmail: true,
    employeeActive: true,
    order: true,
    published: true
};

const publicTeamMemberSelect = {
    id: true,
    name: true,
    role: true,
    department: true,
    teamId: true,
    bio: true,
    avatar: true,
    linkedIn: true,
    twitter: true,
    order: true,
    published: true
};

async function buildTeamMemberData(payload, existingMember) {
    const data = {
        name: payload.name,
        role: payload.role,
        department: payload.department || 'Operations',
        teamId: payload.teamId,
        bio: payload.bio,
        avatar: payload.avatar,
        linkedIn: payload.linkedIn,
        twitter: payload.twitter,
        workEmail: payload.workEmail ? payload.workEmail.toLowerCase() : null,
        employeeActive: payload.employeeActive ?? existingMember?.employeeActive ?? true,
        order: payload.order ?? existingMember?.order ?? 0,
        published: payload.published ?? existingMember?.published ?? true
    };

    if (payload.employeePassword) {
        data.passwordHash = await bcrypt.hash(payload.employeePassword, 12);
    } else if (existingMember) {
        data.passwordHash = existingMember.passwordHash;
    }

    return data;
}

router.get('/admin/all', auth, async (req, res, next) => {
    try {
        const team = await prisma.teamMember.findMany({
            select: adminTeamMemberSelect,
            orderBy: { order: 'asc' }
        });
        res.json(team);
    } catch (error) {
        next(error);
    }
});

// Public: List team
router.get('/', async (req, res, next) => {
    try {
        const team = await prisma.teamMember.findMany({
            where: { published: true },
            select: publicTeamMemberSelect,
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
        const data = await buildTeamMemberData(req.body);
        const member = await prisma.teamMember.create({
            data,
            select: adminTeamMemberSelect
        });
        res.status(201).json(member);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(teamMemberSchema), async (req, res, next) => {
    try {
        const existingMember = await prisma.teamMember.findUnique({
            where: { id: req.params.id }
        });

        if (!existingMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        const data = await buildTeamMemberData(req.body, existingMember);
        const member = await prisma.teamMember.update({
            where: { id: req.params.id },
            data,
            select: adminTeamMemberSelect
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
