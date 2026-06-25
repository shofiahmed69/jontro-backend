const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const backupPath = path.join(__dirname, 'db-backup.json');
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ Backup file not found at ${backupPath}`);
        process.exit(1);
    }

    console.log('📖 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    const tablesOrder = [
        'AdminSetting',
        'AdminUser',
        'Stat',
        'Lead',
        'Testimonial',
        'TeamMember',
        'JobListing',
        'Project',
        'BlogPost',
        'WorkReport'
    ];

    console.log('🚀 Starting restore to Coolify database...');

    try {
        console.log('🧹 Clearing JobApplication table...');
        await prisma.jobApplication.deleteMany();
        console.log('✅ JobApplication table cleared.');
    } catch (err) {
        console.error('❌ Error clearing JobApplication table:', err.message);
    }

    for (const table of tablesOrder) {
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        const records = backupData[table] || [];

        if (records.length === 0) {
            console.log(`ℹ️ No records to restore for ${table}`);
            continue;
        }

        console.log(`Restoring ${records.length} records for ${table}...`);

        try {
            // Clean table first (optional but ensures no duplicates or conflicts)
            await prisma[modelName].deleteMany();

            // For tables, we can use createMany
            await prisma[modelName].createMany({
                data: records
            });

            console.log(`✅ Restored ${records.length} records for ${table}`);
        } catch (err) {
            console.error(`❌ Error restoring ${table}:`, err.message);
        }
    }

    console.log('🎉 Database restore completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
