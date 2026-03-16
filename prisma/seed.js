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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
