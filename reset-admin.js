const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { syncAdminCredentials } = require('./src/services/admin-seed');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const result = await syncAdminCredentials({
        prisma,
        bcrypt,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name: 'JONTRO Admin',
        role: 'SUPER_ADMIN'
    });
    console.log(`Admin user ${result.action}: ${result.admin.email}`);
    
  } catch (err) {
      console.error(err);
  } finally {
      await prisma.$disconnect();
  }
}

resetPassword();
