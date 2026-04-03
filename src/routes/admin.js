const express = require('express');
const prisma = require('../services/db');
const auth = require('../middleware/auth');
const { buildReportAnalytics } = require('../services/report-analytics');

const router = express.Router();

router.get('/dashboard-stats', auth, async (req, res, next) => {
    try {
        const [leads, blogs, projects, applications, reports] = await Promise.all([
            prisma.lead.count(),
            prisma.blogPost.count(),
            prisma.project.count(),
            prisma.jobApplication.count(),
            prisma.workReport.findMany({
                include: {
                    teamMember: {
                        select: {
                            id: true,
                            name: true,
                            department: true,
                            teamId: true
                        }
                    }
                },
                orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }]
            })
        ]);

        const recentLeads = await prisma.lead.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        const reportAnalytics = buildReportAnalytics(reports);

        res.json({
            counts: {
                leads,
                blogs,
                projects,
                applications,
                reports: reportAnalytics.summary.totalReports
            },
            recentLeads,
            reportAnalytics,
            recentReports: reports.slice(0, 6)
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
