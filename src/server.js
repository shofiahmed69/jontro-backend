const app = require('./app');
const env = require('./config/env');
const prisma = require('./services/db');
const bcrypt = require('bcryptjs');
const { syncAdminCredentials } = require('./services/admin-seed');
const { seedPrices } = require('./services/seed-prices');

async function connectWithRetry(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            return;
        } catch (error) {
            if (i < retries - 1) {
                await new Promise((r) => setTimeout(r, 5000));
            }
        }
    }
    throw new Error('Database connection failed');
}

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

async function seedIfEmpty() {
    try {
        await syncAdminCredentials({
            prisma,
            bcrypt,
            email: env.ADMIN_EMAIL,
            password: env.ADMIN_PASSWORD,
            name: 'JONTRO Admin',
            role: 'SUPER_ADMIN'
        });

        // Seed default client-side services if the table is empty
        const servicesCount = await prisma.service.count();
        if (servicesCount === 0) {
            await prisma.service.createMany({
                data: [
                    {
                        title: "Custom Software Development",
                        slug: "custom-software-development",
                        description: "Business systems, internal tools, and client platforms built to scale cleanly.",
                        icon: "code",
                        features: ["UI/UX Design", "Responsive Frontend", "Core REST APIs"],
                        techStack: ["React", "Next.js"],
                        pricingTiers: ["starter"],
                        priceMin: 5000,
                        priceMax: 15000,
                        order: 1,
                        published: true
                    },
                    {
                        title: "AI Agent Development",
                        slug: "ai-agent-development",
                        description: "Custom virtual assistants, data extraction tools, and decision-support systems.",
                        icon: "spark",
                        features: ["Custom AI Models", "Search Systems", "AI Chat Integration"],
                        techStack: ["Python", "OpenAI"],
                        pricingTiers: ["growth"],
                        priceMin: 15000,
                        priceMax: 30000,
                        order: 2,
                        published: true
                    },
                    {
                        title: "Workflow Automation",
                        slug: "workflow-automation",
                        description: "Automatic data transfer and task synchronization across your business software.",
                        icon: "flow",
                        features: ["System Integration", "Automatic Alerts", "Data Syncing"],
                        techStack: ["Make.com", "n8n"],
                        pricingTiers: ["starter", "growth"],
                        priceMin: 4000,
                        priceMax: 10000,
                        order: 3,
                        published: true
                    },
                    {
                        title: "SaaS Product Development",
                        slug: "saas-product-development",
                        description: "Subscription-based web applications with user dashboards and automated billing.",
                        icon: "stack",
                        features: ["Secure Login", "Subscription Billing", "User Dashboards"],
                        techStack: ["Next.js", "Stripe"],
                        pricingTiers: ["growth", "enterprise"],
                        priceMin: 20000,
                        priceMax: 50000,
                        order: 4,
                        published: true
                    },
                    {
                        title: "Mobile App Development",
                        slug: "mobile-app-development",
                        description: "Bespoke mobile applications for iOS and Android with offline capability.",
                        icon: "mobile",
                        features: ["iOS & Android Apps", "Offline Support", "Push Notifications"],
                        techStack: ["React Native", "Expo"],
                        pricingTiers: ["growth"],
                        priceMin: 12000,
                        priceMax: 25000,
                        order: 5,
                        published: true
                    },
                    {
                        title: "Cloud & API Systems",
                        slug: "cloud-api-systems",
                        description: "Secure backend databases and custom APIs connecting your platforms and external services.",
                        icon: "cloud",
                        features: ["Cloud Hosting", "Custom APIs", "Secure Databases"],
                        techStack: ["AWS", "Docker"],
                        pricingTiers: ["enterprise"],
                        priceMin: 25000,
                        priceMax: 60000,
                        order: 6,
                        published: true
                    }
                ]
            });
            console.log('✅ Seeding of default client-side services successful!');
        }
    } catch (error) {
        console.error('Failed to seed services:', error);
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
    } catch (error) {
        // Continue startup; migrations should own schema in steady state.
    }
}

async function ensureServicePricingSchema() {
    try {
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Service"
            ADD COLUMN IF NOT EXISTS "priceMinUsd" INTEGER,
            ADD COLUMN IF NOT EXISTS "priceMaxUsd" INTEGER,
            ADD COLUMN IF NOT EXISTS "priceMinEur" INTEGER,
            ADD COLUMN IF NOT EXISTS "priceMaxEur" INTEGER,
            ADD COLUMN IF NOT EXISTS "priceMinBdt" INTEGER,
            ADD COLUMN IF NOT EXISTS "priceMaxBdt" INTEGER
        `);

        await prisma.$executeRawUnsafe(`
            UPDATE "Service"
            SET
                "priceMinUsd" = COALESCE("priceMinUsd", "priceMin"),
                "priceMaxUsd" = COALESCE("priceMaxUsd", "priceMax")
            WHERE "priceMinUsd" IS NULL OR "priceMaxUsd" IS NULL
        `);
    } catch (error) {
        // Continue startup; migrations should own schema in steady state.
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
            INSERT INTO "AdminSetting" ("id", "updatedAt")
            VALUES ('global', NOW())
            ON CONFLICT ("id") DO NOTHING
        `);
    } catch (error) {
        // Continue startup; migrations should own schema in steady state.
    }
}

async function startServer() {
    try {
        console.log('Starting server initialization...');
        await connectWithRetry();
        console.log('Connected to database successfully.');
        await ensureProjectSchema();
        await ensureServicePricingSchema();
        await ensureWorkStreamSchema();
        await seedIfEmpty();
        await seedPrices();
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Fatal startup error:', error);
        process.exit(1);
    }
}

startServer();
