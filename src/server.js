const app = require('./app');
const env = require('./config/env');
console.log('DATABASE_URL being used:', process.env.DATABASE_URL?.substring(0, 50) + '...');
const prisma = require('./services/db');
const bcrypt = require('bcryptjs');

async function connectWithRetry(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect()
            console.log('Database connected successfully')
            return
        } catch (error) {
            console.log(`DB connection attempt ${i + 1} failed:`,
                error.message)
            if (i < retries - 1) {
                await new Promise(r => setTimeout(r, 5000))
            }
        }
    }
    console.error('All DB connection attempts failed')
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect()
})

async function seedIfEmpty() {
    try {
        console.log('--- Database Seed Check ---');
        const adminCount = await prisma.adminUser.count();
        if (adminCount === 0) {
            const hash = await bcrypt.hash('changeme123!', 12);
            await prisma.adminUser.create({
                data: {
                    email: 'admin@jontro.com',
                    password: hash,
                    name: 'JONTRO Admin',
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('✅ Admin user seeded automatically');
        } else {
            console.log('ℹ️ Admin user already exists, skipping seed');
        }
    } catch (error) {
        console.warn('⚠️ Seed check encountered an error (continuing...):', error.message);
    }
}

const PORT = env.PORT || 4000;

async function ensureProjectSchema() {
    try {
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Project"
            ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT ''
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Project"
            ADD COLUMN IF NOT EXISTS "liveUrl" TEXT
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Project"
            ADD COLUMN IF NOT EXISTS "githubUrl" TEXT
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Project"
            ALTER COLUMN "thumbnail" DROP NOT NULL
        `);
        console.log('✅ Project schema check complete');
    } catch (error) {
        console.warn('⚠️ Project schema check failed (continuing...):', error.message);
    }
}

async function ensureWorkStreamSchema() {
    try {
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "ReportPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "WorkReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "BlockerSeverity" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'CRITICAL');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "TeamMember"
            ADD COLUMN IF NOT EXISTS "department" TEXT NOT NULL DEFAULT 'Operations'
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "TeamMember"
            ADD COLUMN IF NOT EXISTS "teamId" TEXT
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "TeamMember"
            ADD COLUMN IF NOT EXISTS "workEmail" TEXT
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "TeamMember"
            ADD COLUMN IF NOT EXISTS "passwordHash" TEXT
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "TeamMember"
            ADD COLUMN IF NOT EXISTS "employeeActive" BOOLEAN NOT NULL DEFAULT true
        `);
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_workEmail_key" ON "TeamMember"("workEmail")
        `);
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "AdminSetting" (
                "id" TEXT NOT NULL DEFAULT 'global',
                "dailyCutoffTime" TEXT NOT NULL DEFAULT '18:00',
                "weeklySummaryDay" TEXT NOT NULL DEFAULT 'Friday',
                "weeklySummaryTime" TEXT NOT NULL DEFAULT '17:00',
                "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
                "alertRouting" BOOLEAN NOT NULL DEFAULT true,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "AdminSetting_pkey" PRIMARY KEY ("id")
            )
        `);
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "WorkReport" (
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
                "authorId" TEXT,
                "submittedById" TEXT,
                "reviewedById" TEXT,
                "submittedAt" TIMESTAMP(3),
                "reviewedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "WorkReport_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "WorkReport_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT "WorkReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT "WorkReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT "WorkReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE
            )
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "WorkReport"
            ALTER COLUMN "authorId" DROP NOT NULL
        `);
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "WorkReport"
            ADD COLUMN IF NOT EXISTS "submittedById" TEXT
        `);
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                ALTER TABLE "WorkReport"
                ADD CONSTRAINT "WorkReport_submittedById_fkey"
                FOREIGN KEY ("submittedById") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WorkReport_status_idx" ON "WorkReport"("status")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WorkReport_department_idx" ON "WorkReport"("department")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WorkReport_submittedAt_idx" ON "WorkReport"("submittedAt")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WorkReport_submittedById_idx" ON "WorkReport"("submittedById")`);
        await prisma.$executeRawUnsafe(`
            INSERT INTO "AdminSetting" ("id")
            VALUES ('global')
            ON CONFLICT ("id") DO NOTHING
        `);
        console.log('✅ WorkStream schema check complete');
    } catch (error) {
        console.warn('⚠️ WorkStream schema check failed (continuing...):', error.message);
    }
}

async function startServer() {
    await connectWithRetry();
    await ensureProjectSchema();
    await ensureWorkStreamSchema();
    await seedIfEmpty();
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
    });
}

startServer();
