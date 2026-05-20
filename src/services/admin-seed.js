async function syncAdminCredentials({
    prisma,
    bcrypt,
    email,
    password,
    name = 'JONTRO Admin',
    role = 'SUPER_ADMIN'
}) {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: normalizedEmail }
    });

    if (!existingAdmin) {
        const admin = await prisma.adminUser.create({
            data: {
                email: normalizedEmail,
                password: passwordHash,
                name,
                role
            }
        });

        return { action: 'created', admin };
    }

    const admin = await prisma.adminUser.update({
        where: { email: normalizedEmail },
        data: {
            password: passwordHash,
            name,
            role
        }
    });

    return { action: 'updated', admin };
}

module.exports = {
    syncAdminCredentials
};
