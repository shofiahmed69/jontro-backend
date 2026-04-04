const test = require('node:test');
const assert = require('node:assert/strict');

const { createAdminOperations } = require('../src/mcp/admin-operations');

test('listLeads applies pagination, status, and search filters', async () => {
    const captured = {};
    const operations = createAdminOperations({
        prisma: {
            lead: {
                findMany: async (args) => {
                    captured.findMany = args;
                    return [{ id: 'lead-1', name: 'Acme' }];
                },
                count: async (args) => {
                    captured.count = args;
                    return 1;
                }
            }
        }
    });

    const result = await operations.listLeads({
        status: 'NEW',
        search: 'acme',
        page: 2,
        limit: 5
    });

    assert.deepEqual(captured.findMany.where, {
        status: 'NEW',
        OR: [
            { name: { contains: 'acme', mode: 'insensitive' } },
            { email: { contains: 'acme', mode: 'insensitive' } },
            { company: { contains: 'acme', mode: 'insensitive' } }
        ]
    });
    assert.equal(captured.findMany.skip, 5);
    assert.equal(captured.findMany.take, 5);
    assert.deepEqual(captured.count, { where: captured.findMany.where });
    assert.equal(result.totalPages, 1);
    assert.equal(result.items.length, 1);
});

test('getDashboardStats combines counts, recent leads, and analytics summary', async () => {
    const operations = createAdminOperations({
        prisma: {
            lead: {
                count: async () => 4,
                findMany: async () => [{ id: 'lead-1' }]
            },
            blogPost: { count: async () => 2 },
            project: { count: async () => 3 },
            jobApplication: { count: async () => 1 },
            workReport: {
                findMany: async () => [{ id: 'report-1' }, { id: 'report-2' }]
            }
        },
        buildReportAnalytics: () => ({
            summary: { totalReports: 2 },
            organizationHealth: { complianceRate: 80 }
        })
    });

    const result = await operations.getDashboardStats();

    assert.deepEqual(result.counts, {
        leads: 4,
        blogs: 2,
        projects: 3,
        applications: 1,
        reports: 2
    });
    assert.equal(result.recentLeads.length, 1);
    assert.equal(result.recentReports.length, 2);
    assert.equal(result.reportAnalytics.organizationHealth.complianceRate, 80);
});

test('toggleProjectFlag flips the selected boolean field', async () => {
    const calls = [];
    const operations = createAdminOperations({
        prisma: {
            project: {
                findUnique: async ({ where }) => {
                    calls.push({ type: 'findUnique', where });
                    return { id: where.id, published: false };
                },
                update: async ({ where, data }) => {
                    calls.push({ type: 'update', where, data });
                    return { id: where.id, published: data.published };
                }
            }
        }
    });

    const result = await operations.toggleProjectFlag({
        id: 'project-1',
        field: 'published'
    });

    assert.deepEqual(calls, [
        { type: 'findUnique', where: { id: 'project-1' } },
        { type: 'update', where: { id: 'project-1' }, data: { published: true } }
    ]);
    assert.equal(result.published, true);
});
