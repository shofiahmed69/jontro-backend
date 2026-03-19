const app = require('./app');
const env = require('./config/env');
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

async function startServer() {
    await connectWithRetry();
    await seedIfEmpty();
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
    });
}

startServer();
