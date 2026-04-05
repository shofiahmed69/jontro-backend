require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const prisma = require('./src/services/db');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function uploadAndSetImage() {
    console.log('Initiating registry image synchronization...');
    try {
        const filePath = '/home/alvee/Desktop/ss/Screenshot_20260405_215838.png';
        const fileContent = fs.readFileSync(filePath);
        const fileName = `projects/${Date.now()}-Evergreen-Detail.png`;

        const { error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'jontro-uploads')
            .upload(fileName, fileContent, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;

        const { data } = supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'jontro-uploads')
            .getPublicUrl(fileName);

        const project = await prisma.project.update({
            where: { slug: 'evergreen-international' },
            data: { thumbnail: data.publicUrl }
        });

        console.log(`  [OK] Profile synchronised: ${project.title}`);
        console.log(`  [OK] New Artifact: ${data.publicUrl}`);
    } catch (e) {
        console.error(`  [FAILURE] Image synchronisation error: ${e.message}`);
    }
    await prisma.$disconnect();
    process.exit(0);
}

uploadAndSetImage();
