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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if environment variables match (env-admin fallback)
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: 'env-admin', email: process.env.ADMIN_EMAIL, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            console.log('Login successful (env-admin):', email);

            return res.json({
                success: true,
                token,
                user: {
                    id: 'env-admin',
                    email: process.env.ADMIN_EMAIL,
                    name: 'System Admin',
                    role: 'admin'
                }
            });
        }

        // Check database
        const admin = await prisma.adminUser.findUnique({
            where: { email }
        });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log('Login successful:', admin.email);

        res.json({
            success: true,
            token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
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
