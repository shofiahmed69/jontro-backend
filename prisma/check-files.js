const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'db-backup.json');
if (!fs.existsSync(backupPath)) {
  console.error('db-backup.json not found');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const urls = new Set();

function extractUrls(obj) {
  if (typeof obj === 'string' && obj.includes('supabase.co')) {
    urls.add(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach(extractUrls);
  } else if (obj !== null && typeof obj === 'object') {
    Object.values(obj).forEach(extractUrls);
  }
}

extractUrls(data);
console.log(`Found ${urls.size} unique Supabase URLs.`);
console.log('Sample URLs:', Array.from(urls).slice(0, 10));
