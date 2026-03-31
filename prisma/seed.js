const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.adminUser.upsert({
        where: { email: 'admin@jontro.com' },
        update: {},
        create: {
            email: 'admin@jontro.com',
            password: await bcrypt.hash('changeme123!', 12),
            name: 'JONTRO Admin',
            role: 'SUPER_ADMIN'
        }
    });

    console.log('✅ Seed successful! Admin user created:', admin.email);

    // Seed Projects
    const existingProjects = await prisma.project.count()
    if (existingProjects === 0) {
        await prisma.project.createMany({
            data: [
                {
                    title: "NexaFlow CRM",
                    slug: "nexaflow-crm",
                    client: "NexaFlow Inc",
                    thumbnail: "",
                    category: ["Web", "SaaS"],
                    challenge: "Client needed unified pipeline tracking and reporting",
                    approach: "Built with React and Node.js with real-time updates",
                    features: ["Pipeline tracking", "AI follow-up", "Reporting"],
                    techStack: ["React", "Node.js", "PostgreSQL"],
                    results: "50% increase in sales efficiency",
                    featured: true,
                    published: true,
                    order: 1
                },
                {
                    title: "PulseAI Assistant",
                    slug: "pulseai-assistant",
                    client: "PulseAI",
                    thumbnail: "",
                    category: ["AI", "Automation"],
                    challenge: "Team needed faster knowledge retrieval",
                    approach: "Built with OpenAI API and Python backend",
                    features: ["Knowledge retrieval", "Auto-response", "Integration"],
                    techStack: ["OpenAI", "Python", "FastAPI"],
                    results: "60% reduction in response time",
                    featured: true,
                    published: true,
                    order: 2
                },
                {
                    title: "AutomateX Platform",
                    slug: "automatex-platform",
                    client: "AutomateX",
                    thumbnail: "",
                    category: ["Automation", "SaaS"],
                    challenge: "Complex approval workflows needed automation",
                    approach: "Built workflow engine with PostgreSQL and AWS",
                    features: ["Process orchestration", "Notifications", "Data integration"],
                    techStack: ["PostgreSQL", "AWS", "Node.js"],
                    results: "80% reduction in manual processes",
                    featured: true,
                    published: true,
                    order: 3
                }
            ]
        })
        console.log('✅ Default projects seeded')
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
