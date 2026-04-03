const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../services/db');
const teamMembers = require('../services/team-members');
const auth = require('../middleware/auth');
const employeeAuth = require('../middleware/employeeAuth');

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
                role: admin.role,
                type: 'admin'
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

router.post('/employee/login', async (req, res) => {
    try {
        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const employee = await teamMembers.getTeamMemberByWorkEmail(email);

        if (!employee) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!employee.employeeActive) {
            return res.status(403).json({ error: 'Employee access is disabled. Contact admin.' });
        }

        if (!employee.passwordHash) {
            return res.status(403).json({ error: 'Employee login is not configured yet. Ask admin to set your password.' });
        }

        const validPassword = await bcrypt.compare(password, employee.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                type: 'employee',
                teamMemberId: employee.id,
                email: employee.workEmail,
                role: employee.role,
                name: employee.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: employee.id,
                email: employee.workEmail,
                name: employee.name,
                role: employee.role,
                department: employee.department,
                teamId: employee.teamId
            }
        });
    } catch (error) {
        console.error('Employee login route error:', error);
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

router.get('/employee/me', employeeAuth, async (req, res, next) => {
    try {
        const user = await teamMembers.getTeamMemberById(req.employee.teamMemberId);

        if (!user || !user.employeeActive) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({
            id: user.id,
            email: user.workEmail,
            name: user.name,
            role: user.role,
            department: user.department,
            teamId: user.teamId
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
