const test = require('node:test');
const assert = require('node:assert/strict');

const { buildReportAnalytics } = require('../src/services/report-analytics');

test('buildReportAnalytics summarizes report health, velocity, and roster activity', () => {
    const reports = [
        {
            id: 'r1',
            status: 'SUBMITTED',
            periodType: 'DAILY',
            department: 'Engineering',
            teamId: 'alpha',
            blockerSeverity: 'CRITICAL',
            createdAt: '2026-04-01T08:00:00.000Z',
            submittedAt: '2026-04-01T08:00:00.000Z',
            reviewedAt: null,
            teamMember: { id: 't1', name: 'Ava' }
        },
        {
            id: 'r2',
            status: 'APPROVED',
            periodType: 'WEEKLY',
            department: 'Engineering',
            teamId: 'alpha',
            blockerSeverity: 'NONE',
            createdAt: '2026-04-02T09:00:00.000Z',
            submittedAt: '2026-04-02T09:00:00.000Z',
            reviewedAt: '2026-04-02T12:00:00.000Z',
            teamMember: { id: 't1', name: 'Ava' }
        },
        {
            id: 'r3',
            status: 'NEEDS_REVISION',
            periodType: 'MONTHLY',
            department: 'Operations',
            teamId: 'ops-1',
            blockerSeverity: 'MEDIUM',
            createdAt: '2026-04-03T10:00:00.000Z',
            submittedAt: '2026-04-03T10:00:00.000Z',
            reviewedAt: '2026-04-03T15:00:00.000Z',
            teamMember: { id: 't2', name: 'Noor' }
        }
    ];

    const analytics = buildReportAnalytics(reports, {
        now: new Date('2026-04-03T18:00:00.000Z')
    });

    assert.equal(analytics.summary.totalReports, 3);
    assert.equal(analytics.summary.pendingReports, 1);
    assert.equal(analytics.summary.approvedReports, 1);
    assert.equal(analytics.summary.needsRevisionReports, 1);
    assert.equal(analytics.summary.criticalBlockers, 1);
    assert.equal(analytics.organizationHealth.activeDepartments, 2);
    assert.equal(analytics.organizationHealth.complianceRate, 33);
    assert.equal(analytics.departmentCompliance.length, 2);
    assert.equal(analytics.teamRoster[0].memberName, 'Ava');
    assert.equal(analytics.teamRoster[0].reportCount, 2);
    assert.ok(analytics.velocity.some((entry) => entry.submitted > 0));
});
