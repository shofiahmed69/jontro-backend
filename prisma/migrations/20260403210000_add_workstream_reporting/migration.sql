CREATE TYPE "ReportPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

CREATE TYPE "WorkReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION');

CREATE TYPE "BlockerSeverity" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'CRITICAL');

ALTER TABLE "TeamMember"
ADD COLUMN IF NOT EXISTS "department" TEXT NOT NULL DEFAULT 'Operations';

ALTER TABLE "TeamMember"
ADD COLUMN IF NOT EXISTS "teamId" TEXT;

CREATE TABLE "AdminSetting" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "dailyCutoffTime" TEXT NOT NULL DEFAULT '18:00',
    "weeklySummaryDay" TEXT NOT NULL DEFAULT 'Friday',
    "weeklySummaryTime" TEXT NOT NULL DEFAULT '17:00',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "alertRouting" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodType" "ReportPeriod" NOT NULL,
    "status" "WorkReportStatus" NOT NULL DEFAULT 'DRAFT',
    "department" TEXT NOT NULL,
    "teamId" TEXT,
    "accomplishments" TEXT NOT NULL,
    "nextSteps" TEXT NOT NULL,
    "blockers" TEXT,
    "blockerSeverity" "BlockerSeverity" NOT NULL DEFAULT 'NONE',
    "feedback" TEXT,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "teamMemberId" TEXT,
    "authorId" TEXT NOT NULL,
    "reviewedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkReport_status_idx" ON "WorkReport"("status");
CREATE INDEX "WorkReport_department_idx" ON "WorkReport"("department");
CREATE INDEX "WorkReport_submittedAt_idx" ON "WorkReport"("submittedAt");

ALTER TABLE "WorkReport"
ADD CONSTRAINT "WorkReport_teamMemberId_fkey"
FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkReport"
ADD CONSTRAINT "WorkReport_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkReport"
ADD CONSTRAINT "WorkReport_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
