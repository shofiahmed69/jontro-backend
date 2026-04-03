function toDayKey(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function createVelocityWindow(now) {
    return Array.from({ length: 7 }, (_, index) => {
        const current = new Date(now);
        current.setUTCHours(0, 0, 0, 0);
        current.setUTCDate(current.getUTCDate() - (6 - index));
        return {
            key: current.toISOString().slice(0, 10),
            label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
            submitted: 0,
            approved: 0
        };
    });
}

function round(value) {
    return Number.isFinite(value) ? Math.round(value) : 0;
}

function buildReportAnalytics(reports, options = {}) {
    const now = options.now ? new Date(options.now) : new Date();
    const summary = {
        totalReports: reports.length,
        pendingReports: 0,
        approvedReports: 0,
        needsRevisionReports: 0,
        draftReports: 0,
        criticalBlockers: 0
    };

    const velocity = createVelocityWindow(now);
    const velocityMap = new Map(velocity.map((entry) => [entry.key, entry]));
    const departmentMap = new Map();
    const teamMap = new Map();
    const approvalDurations = [];

    for (const report of reports) {
        if (report.status === 'SUBMITTED') summary.pendingReports += 1;
        if (report.status === 'APPROVED') summary.approvedReports += 1;
        if (report.status === 'NEEDS_REVISION') summary.needsRevisionReports += 1;
        if (report.status === 'DRAFT') summary.draftReports += 1;
        if (report.blockerSeverity === 'CRITICAL') summary.criticalBlockers += 1;

        const submittedKey = report.submittedAt ? toDayKey(report.submittedAt) : toDayKey(report.createdAt);
        const velocityEntry = velocityMap.get(submittedKey);
        if (velocityEntry && report.status !== 'DRAFT') {
            velocityEntry.submitted += 1;
        }

        if (report.reviewedAt && report.status === 'APPROVED') {
            const approvedEntry = velocityMap.get(toDayKey(report.reviewedAt));
            if (approvedEntry) approvedEntry.approved += 1;
        }

        const departmentKey = report.department || 'Unassigned';
        const departmentEntry = departmentMap.get(departmentKey) || {
            department: departmentKey,
            total: 0,
            approved: 0,
            submitted: 0,
            needsRevision: 0,
            complianceRate: 0
        };
        departmentEntry.total += 1;
        if (report.status === 'APPROVED') departmentEntry.approved += 1;
        if (report.status === 'SUBMITTED') departmentEntry.submitted += 1;
        if (report.status === 'NEEDS_REVISION') departmentEntry.needsRevision += 1;
        departmentMap.set(departmentKey, departmentEntry);

        if (report.teamMember) {
            const teamEntry = teamMap.get(report.teamMember.id) || {
                teamMemberId: report.teamMember.id,
                memberName: report.teamMember.name,
                department: departmentKey,
                teamId: report.teamId || null,
                reportCount: 0,
                approvedCount: 0,
                latestStatus: report.status,
                latestSubmittedAt: report.submittedAt || report.createdAt
            };

            teamEntry.reportCount += 1;
            if (report.status === 'APPROVED') teamEntry.approvedCount += 1;
            if (new Date(report.submittedAt || report.createdAt) > new Date(teamEntry.latestSubmittedAt)) {
                teamEntry.latestStatus = report.status;
                teamEntry.latestSubmittedAt = report.submittedAt || report.createdAt;
            }
            teamMap.set(report.teamMember.id, teamEntry);
        }

        if (report.reviewedAt && report.submittedAt) {
            approvalDurations.push(
                (new Date(report.reviewedAt).getTime() - new Date(report.submittedAt).getTime()) / (1000 * 60 * 60)
            );
        }
    }

    const departmentCompliance = Array.from(departmentMap.values())
        .map((entry) => ({
            ...entry,
            complianceRate: entry.total ? round((entry.approved / entry.total) * 100) : 0
        }))
        .sort((a, b) => b.total - a.total);

    const teamRoster = Array.from(teamMap.values()).sort((a, b) => {
        if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
        return a.memberName.localeCompare(b.memberName);
    });

    const organizationHealth = {
        activeDepartments: departmentCompliance.length,
        complianceRate: summary.totalReports ? round((summary.approvedReports / summary.totalReports) * 100) : 0,
        averageApprovalHours: approvalDurations.length
            ? Number((approvalDurations.reduce((sum, value) => sum + value, 0) / approvalDurations.length).toFixed(1))
            : 0
    };

    return {
        summary,
        organizationHealth,
        velocity,
        departmentCompliance,
        teamRoster
    };
}

module.exports = {
    buildReportAnalytics
};
