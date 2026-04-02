const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'admin@jontro.com';
    const newPassword = 'admin123';
    
    // Check if user exists
    const user = await prisma.adminUser.findUnique({
        where: { email }
    });
    
    if (!user) {
        console.log(`User ${email} not found. Creating...`);
        const hash = await bcrypt.hash(newPassword, 12);
        await prisma.adminUser.create({
            data: {
                email,
                password: hash,
                name: 'JONTRO Admin',
                role: 'SUPER_ADMIN'
            }
        });
        console.log('Created admin@jontro.com with password: admin123');
    } else {
        console.log(`User ${email} found. Resetting password...`);
        const hash = await bcrypt.hash(newPassword, 12);
        await prisma.adminUser.update({
            where: { email },
            data: { password: hash }
        });
        console.log('Reset admin@jontro.com password to: admin123');
    }
    
  } catch (err) {
      console.error(err);
  } finally {
      await prisma.$disconnect();
  }
}

resetPassword();
