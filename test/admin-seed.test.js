const test = require('node:test');
const assert = require('node:assert/strict');

const { syncAdminCredentials } = require('../src/services/admin-seed');

test('syncAdminCredentials creates the configured admin user when missing', async () => {
    const calls = [];
    const prisma = {
        adminUser: {
            findUnique: async ({ where }) => {
                calls.push({ type: 'findUnique', where });
                return null;
            },
            create: async ({ data }) => {
                calls.push({ type: 'create', data });
                return { id: 'admin-1', ...data };
            }
        }
    };
    const bcrypt = {
        hash: async (value, rounds) => `hash:${value}:${rounds}`
    };

    const result = await syncAdminCredentials({
        prisma,
        bcrypt,
        email: 'admin@jontro.com',
        password: 'admin123',
        name: 'JONTRO Admin',
        role: 'SUPER_ADMIN'
    });

    assert.equal(result.action, 'created');
    assert.deepEqual(calls, [
        { type: 'findUnique', where: { email: 'admin@jontro.com' } },
        {
            type: 'create',
            data: {
                email: 'admin@jontro.com',
                password: 'hash:admin123:12',
                name: 'JONTRO Admin',
                role: 'SUPER_ADMIN'
            }
        }
    ]);
});

test('syncAdminCredentials updates the password hash for an existing admin user', async () => {
    const calls = [];
    const prisma = {
        adminUser: {
            findUnique: async ({ where }) => {
                calls.push({ type: 'findUnique', where });
                return { id: 'admin-1', email: where.email };
            },
            update: async ({ where, data }) => {
                calls.push({ type: 'update', where, data });
                return { id: 'admin-1', email: where.email, ...data };
            }
        }
    };
    const bcrypt = {
        hash: async (value, rounds) => `hash:${value}:${rounds}`
    };

    const result = await syncAdminCredentials({
        prisma,
        bcrypt,
        email: 'admin@jontro.com',
        password: 'new-password',
        name: 'JONTRO Admin',
        role: 'SUPER_ADMIN'
    });

    assert.equal(result.action, 'updated');
    assert.deepEqual(calls, [
        { type: 'findUnique', where: { email: 'admin@jontro.com' } },
        {
            type: 'update',
            where: { email: 'admin@jontro.com' },
            data: {
                password: 'hash:new-password:12',
                name: 'JONTRO Admin',
                role: 'SUPER_ADMIN'
            }
        }
    ]);
});
