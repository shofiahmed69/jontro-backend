const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔄 Attempting to connect to the database...');
        // Try to reach the database
        await prisma.$connect();
        console.log('✅ Connection to database established successfully.');

        // Query the AdminUser table to ensure we can read data
        const userCount = await prisma.adminUser.count();
        console.log(`📊 Number of admin users in database: ${userCount}`);

        // If there's an admin, let's fetch its email (safely)
        if (userCount > 0) {
            const admin = await prisma.adminUser.findFirst({
                select: { email: true }
            });
            console.log(`👤 Found admin: ${admin.email}`);
        }

        console.log('✅ Database check completed perfectly.');
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
