const app = require('./app');
const env = require('./config/env');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

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
    } finally {
        await prisma.$disconnect();
    }
}

const PORT = env.PORT || 4000;

seedIfEmpty().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
    });
});
