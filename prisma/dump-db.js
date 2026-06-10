const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const backupData = {};
    const tables = [
        'AdminSetting',
        'AdminUser',
        'BlogPost',
        'JobApplication',
        'JobListing',
        'Lead',
        'Project',
        'Service',
        'Stat',
        'TeamMember',
        'Testimonial',
        'WorkReport'
    ];

    console.log('📦 Starting database dump...');

    for (const table of tables) {
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        try {
            console.log(`Fetching records from ${table}...`);
            const records = await prisma[modelName].findMany();
            backupData[table] = records;
            console.log(`Fetched ${records.length} records for ${table}`);
        } catch (err) {
            console.error(`❌ Error fetching ${table}:`, err.message);
        }
    }

    const backupPath = path.join(__dirname, 'db-backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Database dump saved successfully to ${backupPath}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
