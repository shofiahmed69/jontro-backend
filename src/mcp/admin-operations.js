const prismaDefault = require('../services/db');
const { buildReportAnalytics: buildReportAnalyticsDefault } = require('../services/report-analytics');
const teamMembersDefault = require('../services/team-members');
const { generateSlug } = require('../services/slugService');

function normalizePagination(page = 1, limit = 20) {
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));

    return {
        page: parsedPage,
        limit: parsedLimit,
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit
    };
}

function buildLeadWhereClause({ status, search } = {}) {
    const where = {};

    if (status && status !== 'all' && status !== '') {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
        ];
    }

    return where;
}

function createAdminOperations({
    prisma = prismaDefault,
    buildReportAnalytics = buildReportAnalyticsDefault,
    teamMembers = teamMembersDefault
} = {}) {
    return {
        async getDashboardStats() {
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

            return {
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
            };
        },

        async listLeads(input = {}) {
            const { page, limit, skip, take } = normalizePagination(input.page, input.limit);
            const where = buildLeadWhereClause(input);

            const [items, total] = await Promise.all([
                prisma.lead.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.lead.count({ where })
            ]);

            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / take) || 1
            };
        },

        async updateLead({ id, status, notes }) {
            return prisma.lead.update({
                where: { id },
                data: {
                    ...(status !== undefined ? { status } : {}),
                    ...(notes !== undefined ? { notes } : {})
                }
            });
        },

        async deleteLead({ id }) {
            await prisma.lead.delete({ where: { id } });
            return { success: true, id };
        },

        async listProjects() {
            const items = await prisma.project.findMany({
                orderBy: { createdAt: 'desc' }
            });

            return { items, total: items.length };
        },

        async createProject(data) {
            return prisma.project.create({
                data: normalizeProjectPayload(data)
            });
        },

        async updateProject({ id, ...data }) {
            return prisma.project.update({
                where: { id },
                data: normalizeProjectUpdatePayload(data)
            });
        },

        async toggleProjectFlag({ id, field }) {
            if (!['published', 'featured'].includes(field)) {
                throw new Error(`Unsupported project flag: ${field}`);
            }

            const existing = await prisma.project.findUnique({ where: { id } });
            if (!existing) {
                throw new Error('Project not found');
            }

            return prisma.project.update({
                where: { id },
                data: { [field]: !existing[field] }
            });
        },

        async deleteProject({ id }) {
            await prisma.project.delete({ where: { id } });
            return { success: true, id };
        },

        async listBlogPosts({ page, limit } = {}) {
            const pagination = normalizePagination(page, limit || 10);
            const [items, total] = await Promise.all([
                prisma.blogPost.findMany({
                    skip: pagination.skip,
                    take: pagination.take,
                    orderBy: { createdAt: 'desc' },
                    include: { author: { select: { name: true } } }
                }),
                prisma.blogPost.count()
            ]);

            return {
                items,
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.ceil(total / pagination.take) || 1
            };
        },

        async createBlogPost(data) {
            return prisma.blogPost.create({
                data: {
                    ...data,
                    slug: data.slug || generateSlug(data.title)
                }
            });
        },

        async updateBlogPost({ id, ...data }) {
            return prisma.blogPost.update({
                where: { id },
                data
            });
        },

        async deleteBlogPost({ id }) {
            await prisma.blogPost.delete({ where: { id } });
            return { success: true, id };
        },

        async listTeamMembers() {
            const items = await teamMembers.listTeamMembers();
            return { items, total: items.length };
        },

        async listAdminUsers() {
            const items = await prisma.adminUser.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'asc' }
            });

            return { items, total: items.length };
        },

        async listReports(filters = {}) {
            const where = {};
            if (filters.status) where.status = filters.status;
            if (filters.periodType) where.periodType = filters.periodType;
            if (filters.teamMemberId) where.teamMemberId = filters.teamMemberId;
            if (filters.department) where.department = filters.department;

            const reports = await prisma.workReport.findMany({
                where,
                include: {
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
                },
                orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }]
            });

            return {
                items: reports,
                analytics: buildReportAnalytics(reports)
            };
        },

        async reviewReport({ id, reviewerId, status, feedback = '' }) {
            const existing = await prisma.workReport.findUnique({ where: { id } });
            if (!existing) {
                throw new Error('Report not found');
            }

            return prisma.workReport.update({
                where: { id },
                data: {
                    status,
                    feedback: feedback.trim(),
                    reviewedById: reviewerId,
                    reviewedAt: new Date(),
                    revisionCount: status === 'NEEDS_REVISION'
                        ? (existing.revisionCount || 0) + 1
                        : existing.revisionCount
                }
            });
        },

        async getSettings() {
            return prisma.adminSetting.upsert({
                where: { id: 'global' },
                update: {},
                create: { id: 'global' }
            });
        },

        async updateSettings(data) {
            return prisma.adminSetting.upsert({
                where: { id: 'global' },
                update: data,
                create: {
                    id: 'global',
                    ...data
                }
            });
        }
    };
}

function normalizeProjectPayload(data) {
    return {
        title: data.title,
        slug: data.slug || slugify(data.title),
        client: data.client || '',
        thumbnail: data.thumbnail || '',
        liveUrl: data.liveUrl || '',
        githubUrl: data.githubUrl || '',
        category: normalizeStringArray(data.category, ','),
        description: data.description || '',
        challenge: data.challenge || '',
        approach: data.approach || '',
        features: normalizeStringArray(data.features, '\n'),
        techStack: normalizeStringArray(data.techStack, ','),
        results: data.results || '',
        featured: Boolean(data.featured),
        published: Boolean(data.published),
        order: parseInt(data.order, 10) || 0
    };
}

function normalizeProjectUpdatePayload(data) {
    const payload = {};

    for (const key of ['title', 'slug', 'client', 'thumbnail', 'description', 'challenge', 'approach', 'results']) {
        if (data[key] !== undefined) payload[key] = data[key];
    }

    if (data.liveUrl !== undefined) payload.liveUrl = data.liveUrl || '';
    if (data.githubUrl !== undefined) payload.githubUrl = data.githubUrl || '';
    if (data.category !== undefined) payload.category = normalizeStringArray(data.category, ',');
    if (data.features !== undefined) payload.features = normalizeStringArray(data.features, '\n');
    if (data.techStack !== undefined) payload.techStack = normalizeStringArray(data.techStack, ',');
    if (data.featured !== undefined) payload.featured = Boolean(data.featured);
    if (data.published !== undefined) payload.published = Boolean(data.published);
    if (data.order !== undefined) payload.order = parseInt(data.order, 10) || 0;

    return payload;
}

function normalizeStringArray(value, separator) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value || '')
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean);
}

function slugify(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

module.exports = {
    buildLeadWhereClause,
    createAdminOperations,
    normalizePagination,
    normalizeProjectPayload,
    normalizeProjectUpdatePayload
};
