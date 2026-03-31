const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../services/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        console.log('JWT_SECRET for signing:', !!process.env.JWT_SECRET);

        const admin = await prisma.adminUser.findUnique({
            where: { email }
        });

        if (!admin) {
            console.log('Admin not found:', email);
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const validPassword = await bcrypt.compare(
            password, admin.password
        );

        if (!validPassword) {
            console.log('Wrong password for:', email);
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Token signed successfully for:', email);
        console.log('Token preview:', token.substring(0, 30));

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
        console.error('Login route error:', error);
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
