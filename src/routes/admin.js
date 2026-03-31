const express = require('express');
const prisma = require('../services/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard-stats', auth, async (req, res, next) => {
    try {
        const [leads, blogs, projects, applications] = await Promise.all([
            prisma.lead.count(),
            prisma.blogPost.count(),
            prisma.project.count(),
            prisma.jobApplication.count()
        ]);

        const recentLeads = await prisma.lead.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            counts: {
                leads,
                blogs,
                projects,
                applications
            },
            recentLeads
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
