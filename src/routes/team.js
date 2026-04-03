const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const teamMembers = require('../services/team-members');
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
    bio: z.preprocess(
        (value) => {
            if (typeof value !== 'string') return '';
            return value.trim();
        },
        z.string()
    ),
    avatar: z.preprocess(normalizeOptionalUrl, z.string().url().optional()),
    linkedIn: z.preprocess(normalizeOptionalUrl, z.string().url().optional()),
    twitter: z.preprocess(normalizeOptionalUrl, z.string().url().optional()),
    workEmail: z.preprocess(normalizeOptionalString, z.string().trim().email().optional()),
    employeePassword: z.preprocess(normalizeOptionalString, z.string().min(6).optional()),
    employeeActive: z.boolean().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
});

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
        const team = await teamMembers.listTeamMembers();
        res.json(team);
    } catch (error) {
        next(error);
    }
});

// Public: List team
router.get('/', async (req, res, next) => {
    try {
        const team = await teamMembers.listTeamMembers({ publishedOnly: true });
        res.json(team);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.post('/', auth, validate(teamMemberSchema), async (req, res, next) => {
    try {
        const data = await buildTeamMemberData(req.body);
        const member = await teamMembers.createTeamMember(data);
        res.status(201).json(member);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(teamMemberSchema), async (req, res, next) => {
    try {
        const existingMember = await teamMembers.getTeamMemberById(req.params.id, { includePassword: true });

        if (!existingMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        const data = await buildTeamMemberData(req.body, existingMember);
        const member = await teamMembers.updateTeamMember(req.params.id, data);
        res.json(member);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await teamMembers.deleteTeamMember(req.params.id);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
