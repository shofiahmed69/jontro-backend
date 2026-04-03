const { Prisma } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = require('./db');

const publicSelect = Prisma.sql`
    "id",
    "name",
    "role",
    "department",
    "teamId",
    "bio",
    "avatar",
    "linkedIn",
    "twitter",
    "workEmail",
    "employeeActive",
    "order",
    "published"
`;

const privateSelect = Prisma.sql`
    "id",
    "name",
    "role",
    "department",
    "teamId",
    "bio",
    "avatar",
    "linkedIn",
    "twitter",
    "workEmail",
    "passwordHash",
    "employeeActive",
    "order",
    "published"
`;

async function listTeamMembers({ publishedOnly = false } = {}) {
    if (publishedOnly) {
        return prisma.$queryRaw`
            SELECT ${publicSelect}
            FROM "TeamMember"
            WHERE "published" = true
            ORDER BY "order" ASC
        `;
    }

    return prisma.$queryRaw`
        SELECT ${publicSelect}
        FROM "TeamMember"
        ORDER BY "order" ASC
    `;
}

async function getTeamMemberById(id, { includePassword = false } = {}) {
    const rows = await prisma.$queryRaw`
        SELECT ${includePassword ? privateSelect : publicSelect}
        FROM "TeamMember"
        WHERE "id" = ${id}
        LIMIT 1
    `;

    return rows[0] || null;
}

async function getTeamMemberByWorkEmail(workEmail) {
    const rows = await prisma.$queryRaw`
        SELECT ${privateSelect}
        FROM "TeamMember"
        WHERE LOWER("workEmail") = LOWER(${workEmail})
        LIMIT 1
    `;

    return rows[0] || null;
}

async function createTeamMember(data) {
    const id = randomUUID();
    const rows = await prisma.$queryRaw`
        INSERT INTO "TeamMember" (
            "id",
            "name",
            "role",
            "department",
            "teamId",
            "bio",
            "avatar",
            "linkedIn",
            "twitter",
            "workEmail",
            "passwordHash",
            "employeeActive",
            "order",
            "published"
        )
        VALUES (
            ${id},
            ${data.name},
            ${data.role},
            ${data.department},
            ${data.teamId ?? null},
            ${data.bio ?? ''},
            ${data.avatar ?? null},
            ${data.linkedIn ?? null},
            ${data.twitter ?? null},
            ${data.workEmail ?? null},
            ${data.passwordHash ?? null},
            ${data.employeeActive ?? true},
            ${data.order ?? 0},
            ${data.published ?? true}
        )
        RETURNING ${publicSelect}
    `;

    return rows[0];
}

async function updateTeamMember(id, data) {
    const rows = await prisma.$queryRaw`
        UPDATE "TeamMember"
        SET
            "name" = ${data.name},
            "role" = ${data.role},
            "department" = ${data.department},
            "teamId" = ${data.teamId ?? null},
            "bio" = ${data.bio ?? ''},
            "avatar" = ${data.avatar ?? null},
            "linkedIn" = ${data.linkedIn ?? null},
            "twitter" = ${data.twitter ?? null},
            "workEmail" = ${data.workEmail ?? null},
            "passwordHash" = ${data.passwordHash ?? null},
            "employeeActive" = ${data.employeeActive ?? true},
            "order" = ${data.order ?? 0},
            "published" = ${data.published ?? true}
        WHERE "id" = ${id}
        RETURNING ${publicSelect}
    `;

    return rows[0] || null;
}

async function deleteTeamMember(id) {
    await prisma.$executeRaw`
        DELETE FROM "TeamMember"
        WHERE "id" = ${id}
    `;
}

module.exports = {
    listTeamMembers,
    getTeamMemberById,
    getTeamMemberByWorkEmail,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
};
