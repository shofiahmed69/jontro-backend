const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const env = require('../config/env');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if environment variables match
        if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: 'env-admin', email: env.ADMIN_EMAIL, role: 'admin' },
                env.JWT_SECRET,
                { expiresIn: env.JWT_EXPIRES_IN }
            );

            return res.json({
                token,
                user: {
                    id: 'env-admin',
                    email: env.ADMIN_EMAIL,
                    name: 'System Admin',
                    role: 'admin'
                }
            });
        }

        const user = await prisma.adminUser.findUnique({
            where: { email }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await prisma.adminUser.findUnique({
            where: { id: req.admin.id },
            select: { id: true, email: true, name: true, role: true }
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
