const express = require('express');
const { z } = require('zod');
const { Prisma } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = require('../services/db');
const auth = require('../middleware/auth');
const employeeAuth = require('../middleware/employeeAuth');
const { buildReportAnalytics } = require('../services/report-analytics');
const teamMembers = require('../services/team-members');

const router = express.Router();

const reportInclude = {
    teamMember: {
        select: {
            id: true,
            name: true,
            role: true,
            department: true,
            teamId: true
        }
    },
    author: {
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        }
    },
    reviewer: {
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        }
    },
    submittedBy: {
        select: {
            id: true,
            name: true,
            role: true,
            workEmail: true
        }
    }
};

const reportSchema = z.object({
    teamMemberId: z.string().min(1),
    periodType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    title: z.string().min(3).optional(),
    accomplishments: z.string().min(3),
    nextSteps: z.string().min(3),
    blockers: z.string().optional().default(''),
    blockerSeverity: z.enum(['NONE', 'LOW', 'MEDIUM', 'CRITICAL']).optional().default('NONE'),
    status: z.enum(['DRAFT', 'SUBMITTED']).optional().default('SUBMITTED')
});

const reviewSchema = z.object({
    status: z.enum(['APPROVED', 'NEEDS_REVISION']),
    feedback: z.string().optional().default('')
});

const employeeReportSchema = z.object({
    periodType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    title: z.string().min(3).optional(),
    accomplishments: z.string().min(3),
    nextSteps: z.string().min(3),
    blockers: z.string().optional().default(''),
    blockerSeverity: z.enum(['NONE', 'LOW', 'MEDIUM', 'CRITICAL']).optional().default('NONE'),
    status: z.enum(['DRAFT', 'SUBMITTED']).optional().default('SUBMITTED')
});

const settingsSchema = z.object({
    dailyCutoffTime: z.string().min(3),
    weeklySummaryDay: z.string().min(3),
    weeklySummaryTime: z.string().min(3),
    emailNotifications: z.boolean(),
    alertRouting: z.boolean()
});

async function resolveTeamMember(teamMemberId) {
    return teamMembers.getTeamMemberById(teamMemberId);
}

async function safeFindReports(where = {}) {
    try {
        return await prisma.workReport.findMany({
            where,
            include: reportInclude,
            orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }]
        });
    } catch (error) {
        console.warn('WorkReport query fallback triggered:', error.message);
        return [];
    }
}

function createReportTitle(periodType, memberName) {
    const stamp = new Date().toISOString().slice(0, 10);
    return `${periodType} Report · ${memberName} · ${stamp}`;
}

async function createEmployeeReportRecord(teamMember, payload) {
    const id = randomUUID();
    const now = new Date();
    const submittedAt = payload.status === 'DRAFT' ? null : now;

    const rows = await prisma.$queryRaw`
        INSERT INTO "WorkReport" (
            "id",
            "title",
            "periodType",
            "status",
            "department",
            "teamId",
            "accomplishments",
            "nextSteps",
            "blockers",
            "blockerSeverity",
            "teamMemberId",
            "submittedById",
            "submittedAt",
            "createdAt",
            "updatedAt"
        )
        VALUES (
            ${id},
            ${payload.title?.trim() || createReportTitle(payload.periodType, teamMember.name)},
            ${payload.periodType}::"ReportPeriod",
            ${payload.status}::"WorkReportStatus",
            ${teamMember.department},
            ${teamMember.teamId || null},
            ${payload.accomplishments.trim()},
            ${payload.nextSteps.trim()},
            ${payload.blockers?.trim() || ''},
            ${payload.blockerSeverity}::"BlockerSeverity",
            ${teamMember.id},
            ${teamMember.id},
            ${submittedAt},
            ${now},
            ${now}
        )
        RETURNING "id", "title", "periodType", "status", "submittedAt", "createdAt"
    `;

    return rows[0];
}

router.get('/employee/my', employeeAuth, async (req, res, next) => {
    try {
        const [teamMember, reports] = await Promise.all([
            teamMembers.getTeamMemberById(req.employee.teamMemberId),
            safeFindReports({ teamMemberId: req.employee.teamMemberId })
        ]);

        if (!teamMember || !teamMember.employeeActive) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({
            employee: teamMember,
            reports,
            analytics: buildReportAnalytics(reports, { teamMembers: [teamMember] })
        });
    } catch (error) {
        next(error);
    }
});

router.post('/employee/submit', employeeAuth, async (req, res, next) => {
    try {
        const payload = employeeReportSchema.parse(req.body);
        const teamMember = await resolveTeamMember(req.employee.teamMemberId);

        if (!teamMember || !teamMember.employeeActive) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const report = await createEmployeeReportRecord(teamMember, payload);

        res.status(201).json(report);
    } catch (error) {
        next(error);
    }
});

router.get('/', auth, async (req, res, next) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.periodType) where.periodType = req.query.periodType;
        if (req.query.teamMemberId) where.teamMemberId = req.query.teamMemberId;
        if (req.query.department) where.department = req.query.department;

        const reports = await safeFindReports(where);

        res.json({
            reports,
            analytics: buildReportAnalytics(reports)
        });
    } catch (error) {
        next(error);
    }
});

router.get('/analytics', auth, async (req, res, next) => {
    try {
        const reports = await safeFindReports();

        res.json(buildReportAnalytics(reports));
    } catch (error) {
        next(error);
    }
});

router.get('/team-overview', auth, async (req, res, next) => {
    try {
        const [members, reports] = await Promise.all([
            teamMembers.listTeamMembers(),
            safeFindReports()
        ]);

        const analytics = buildReportAnalytics(reports);
        const rosterMap = new Map(analytics.teamRoster.map((entry) => [entry.teamMemberId, entry]));

        const membersWithReports = members.map((member) => {
            const rosterEntry = rosterMap.get(member.id);
            const latestReport = reports.find((report) => report.teamMemberId === member.id) || null;

            return {
                ...member,
                reportStats: rosterEntry || {
                    teamMemberId: member.id,
                    memberName: member.name,
                    department: member.department,
                    teamId: member.teamId || null,
                    reportCount: 0,
                    approvedCount: 0,
                    latestStatus: 'NO_REPORTS',
                    latestSubmittedAt: null
                },
                latestReport
            };
        });

        res.json({
            team: membersWithReports,
            analytics
        });
    } catch (error) {
        next(error);
    }
});

router.get('/audit', auth, async (req, res, next) => {
    try {
        const reports = (await safeFindReports()).slice(0, 100).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const auditLog = reports.flatMap((report) => {
            const entries = [
                {
                    id: `${report.id}-created`,
                    action: 'REPORT_CREATED',
                    actor: report.author?.name || report.author?.email || 'Unknown',
                    subject: report.title,
                    status: report.status,
                    occurredAt: report.createdAt
                }
            ];

            if (report.reviewedAt) {
                entries.push({
                    id: `${report.id}-reviewed`,
                    action: report.status === 'APPROVED' ? 'REPORT_APPROVED' : 'REVISION_REQUESTED',
                    actor: report.reviewer?.name || report.reviewer?.email || 'Unknown',
                    subject: report.title,
                    status: report.status,
                    occurredAt: report.reviewedAt
                });
            }

            return entries;
        }).sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

        res.json(auditLog);
    } catch (error) {
        next(error);
    }
});

router.get('/settings', auth, async (req, res, next) => {
    try {
        const settings = await prisma.adminSetting.upsert({
            where: { id: 'global' },
            update: {},
            create: { id: 'global' }
        });

        res.json(settings);
    } catch (error) {
        next(error);
    }
});

router.put('/settings', auth, async (req, res, next) => {
    try {
        const payload = settingsSchema.parse(req.body);
        const settings = await prisma.adminSetting.upsert({
            where: { id: 'global' },
            update: payload,
            create: {
                id: 'global',
                ...payload
            }
        });

        res.json(settings);
    } catch (error) {
        next(error);
    }
});

router.post('/', auth, async (req, res, next) => {
    try {
        const payload = reportSchema.parse(req.body);
        const teamMember = await resolveTeamMember(payload.teamMemberId);

        if (!teamMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        const now = new Date();
        const report = await prisma.workReport.create({
            data: {
                title: payload.title?.trim() || createReportTitle(payload.periodType, teamMember.name),
                periodType: payload.periodType,
                status: payload.status,
                department: teamMember.department,
                teamId: teamMember.teamId || null,
                accomplishments: payload.accomplishments.trim(),
                nextSteps: payload.nextSteps.trim(),
                blockers: payload.blockers?.trim() || '',
                blockerSeverity: payload.blockerSeverity,
                teamMemberId: teamMember.id,
                authorId: req.admin.id,
                submittedAt: payload.status === 'DRAFT' ? null : now
            },
            include: reportInclude
        });

        res.status(201).json(report);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, async (req, res, next) => {
    try {
        const payload = reportSchema.parse(req.body);
        const [existing, teamMember] = await Promise.all([
            prisma.workReport.findUnique({ where: { id: req.params.id } }),
            resolveTeamMember(payload.teamMemberId)
        ]);

        if (!existing) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (!teamMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        const isSubmitting = payload.status === 'SUBMITTED' && !existing.submittedAt;
        const report = await prisma.workReport.update({
            where: { id: req.params.id },
            data: {
                title: payload.title?.trim() || createReportTitle(payload.periodType, teamMember.name),
                periodType: payload.periodType,
                status: payload.status,
                department: teamMember.department,
                teamId: teamMember.teamId || null,
                accomplishments: payload.accomplishments.trim(),
                nextSteps: payload.nextSteps.trim(),
                blockers: payload.blockers?.trim() || '',
                blockerSeverity: payload.blockerSeverity,
                teamMemberId: teamMember.id,
                submittedAt: isSubmitting ? new Date() : existing.submittedAt
            },
            include: reportInclude
        });

        res.json(report);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/review', auth, async (req, res, next) => {
    try {
        const payload = reviewSchema.parse(req.body);
        const existing = await prisma.workReport.findUnique({
            where: { id: req.params.id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = await prisma.workReport.update({
            where: { id: req.params.id },
            data: {
                status: payload.status,
                feedback: payload.feedback?.trim() || '',
                reviewedById: req.admin.id,
                reviewedAt: new Date(),
                revisionCount: payload.status === 'NEEDS_REVISION'
                    ? (existing.revisionCount || 0) + 1
                    : existing.revisionCount
            },
            include: reportInclude
        });

        res.json(report);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
