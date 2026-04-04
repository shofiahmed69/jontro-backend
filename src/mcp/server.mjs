#!/usr/bin/env node

import { createRequire } from 'node:module';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const require = createRequire(import.meta.url);

require('../config/env.js');

const { createAdminOperations } = require('./admin-operations.js');

const operations = createAdminOperations();

const server = new McpServer(
    {
        name: 'jontro-admin-mcp',
        version: '1.0.0'
    },
    {
        capabilities: {
            logging: {}
        }
    }
);

function formatJson(data) {
    return JSON.stringify(data, null, 2);
}

function toSuccessResult(summary, structuredContent) {
    return {
        content: [
            {
                type: 'text',
                text: `${summary}\n\n${formatJson(structuredContent)}`
            }
        ],
        structuredContent
    };
}

async function runTool(summary, work) {
    try {
        const structuredContent = await work();
        return toSuccessResult(summary, structuredContent);
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`
                }
            ],
            isError: true
        };
    }
}

server.registerResource(
    'admin-overview',
    new ResourceTemplate('jontro://admin/{section}', { list: undefined }),
    {
        title: 'Jontro Admin Overview',
        description: 'Read-only admin context for dashboard, settings, leads, projects, blogs, team, and reports.',
        mimeType: 'application/json'
    },
    async (_uri, { section }) => {
        let data;

        switch (section) {
            case 'dashboard':
                data = await operations.getDashboardStats();
                break;
            case 'settings':
                data = await operations.getSettings();
                break;
            default:
                data = {
                    supportedSections: ['dashboard', 'settings']
                };
        }

        return {
            contents: [
                {
                    uri: `jontro://admin/${section}`,
                    text: formatJson(data)
                }
            ]
        };
    }
);

server.registerTool(
    'admin_get_dashboard',
    {
        title: 'Get Dashboard',
        description: 'Fetch top-level admin dashboard counts, recent leads, recent reports, and report analytics.',
        inputSchema: {},
        outputSchema: {
            counts: z.object({
                leads: z.number(),
                blogs: z.number(),
                projects: z.number(),
                applications: z.number(),
                reports: z.number()
            }),
            recentLeads: z.array(z.any()),
            reportAnalytics: z.any(),
            recentReports: z.array(z.any())
        }
    },
    async () => runTool('Dashboard fetched.', () => operations.getDashboardStats())
);

server.registerTool(
    'admin_list_leads',
    {
        title: 'List Leads',
        description: 'List submitted leads with optional status/search filters and pagination.',
        inputSchema: {
            status: z.string().optional().describe('Optional lead status filter, for example NEW or QUALIFIED.'),
            search: z.string().optional().describe('Optional free-text search against name, email, or company.'),
            page: z.number().int().min(1).optional(),
            limit: z.number().int().min(1).max(100).optional()
        }
    },
    async (input) => runTool('Leads fetched.', () => operations.listLeads(input))
);

server.registerTool(
    'admin_update_lead',
    {
        title: 'Update Lead',
        description: 'Update a lead status or notes.',
        inputSchema: {
            id: z.string().min(1),
            status: z.string().optional(),
            notes: z.string().optional()
        }
    },
    async (input) => runTool('Lead updated.', () => operations.updateLead(input))
);

server.registerTool(
    'admin_delete_lead',
    {
        title: 'Delete Lead',
        description: 'Delete a lead by ID.',
        inputSchema: {
            id: z.string().min(1)
        }
    },
    async ({ id }) => runTool('Lead deleted.', () => operations.deleteLead({ id }))
);

server.registerTool(
    'admin_list_projects',
    {
        title: 'List Projects',
        description: 'List all portfolio projects, including unpublished ones.',
        inputSchema: {}
    },
    async () => runTool('Projects fetched.', () => operations.listProjects())
);

server.registerTool(
    'admin_create_project',
    {
        title: 'Create Project',
        description: 'Create a new portfolio project.',
        inputSchema: {
            title: z.string().min(1),
            slug: z.string().optional(),
            client: z.string().optional(),
            thumbnail: z.string().optional(),
            liveUrl: z.string().optional(),
            githubUrl: z.string().optional(),
            category: z.union([z.array(z.string()), z.string()]),
            description: z.string().optional(),
            challenge: z.string().optional(),
            approach: z.string().optional(),
            features: z.union([z.array(z.string()), z.string()]).optional(),
            techStack: z.union([z.array(z.string()), z.string()]).optional(),
            results: z.string().optional(),
            featured: z.boolean().optional(),
            published: z.boolean().optional(),
            order: z.union([z.number().int(), z.string()]).optional()
        }
    },
    async (input) => runTool('Project created.', () => operations.createProject(input))
);

server.registerTool(
    'admin_update_project',
    {
        title: 'Update Project',
        description: 'Update an existing portfolio project.',
        inputSchema: {
            id: z.string().min(1),
            title: z.string().optional(),
            slug: z.string().optional(),
            client: z.string().optional(),
            thumbnail: z.string().optional(),
            liveUrl: z.string().optional(),
            githubUrl: z.string().optional(),
            category: z.union([z.array(z.string()), z.string()]).optional(),
            description: z.string().optional(),
            challenge: z.string().optional(),
            approach: z.string().optional(),
            features: z.union([z.array(z.string()), z.string()]).optional(),
            techStack: z.union([z.array(z.string()), z.string()]).optional(),
            results: z.string().optional(),
            featured: z.boolean().optional(),
            published: z.boolean().optional(),
            order: z.union([z.number().int(), z.string()]).optional()
        }
    },
    async (input) => runTool('Project updated.', () => operations.updateProject(input))
);

server.registerTool(
    'admin_toggle_project_flag',
    {
        title: 'Toggle Project Flag',
        description: 'Toggle project published or featured state.',
        inputSchema: {
            id: z.string().min(1),
            field: z.enum(['published', 'featured'])
        }
    },
    async (input) => runTool('Project flag updated.', () => operations.toggleProjectFlag(input))
);

server.registerTool(
    'admin_delete_project',
    {
        title: 'Delete Project',
        description: 'Delete a portfolio project by ID.',
        inputSchema: {
            id: z.string().min(1)
        }
    },
    async ({ id }) => runTool('Project deleted.', () => operations.deleteProject({ id }))
);

server.registerTool(
    'admin_list_blog_posts',
    {
        title: 'List Blog Posts',
        description: 'List blog posts for admin review with pagination.',
        inputSchema: {
            page: z.number().int().min(1).optional(),
            limit: z.number().int().min(1).max(100).optional()
        }
    },
    async (input) => runTool('Blog posts fetched.', () => operations.listBlogPosts(input))
);

server.registerTool(
    'admin_create_blog_post',
    {
        title: 'Create Blog Post',
        description: 'Create a new blog post.',
        inputSchema: {
            title: z.string().min(5),
            slug: z.string().optional(),
            excerpt: z.string().min(20),
            content: z.string().min(100),
            heroImage: z.string().optional(),
            category: z.string().min(1),
            tags: z.array(z.string()).optional(),
            authorId: z.string().min(1),
            readTime: z.number().int().min(1),
            published: z.boolean().optional(),
            seoTitle: z.string().optional(),
            seoDescription: z.string().optional(),
            publishedAt: z.string().datetime().optional()
        }
    },
    async (input) => runTool('Blog post created.', () => operations.createBlogPost(input))
);

server.registerTool(
    'admin_update_blog_post',
    {
        title: 'Update Blog Post',
        description: 'Update an existing blog post.',
        inputSchema: {
            id: z.string().min(1),
            title: z.string().optional(),
            slug: z.string().optional(),
            excerpt: z.string().optional(),
            content: z.string().optional(),
            heroImage: z.string().optional(),
            category: z.string().optional(),
            tags: z.array(z.string()).optional(),
            authorId: z.string().optional(),
            readTime: z.number().int().min(1).optional(),
            published: z.boolean().optional(),
            seoTitle: z.string().optional(),
            seoDescription: z.string().optional(),
            publishedAt: z.string().datetime().optional()
        }
    },
    async (input) => runTool('Blog post updated.', () => operations.updateBlogPost(input))
);

server.registerTool(
    'admin_delete_blog_post',
    {
        title: 'Delete Blog Post',
        description: 'Delete a blog post by ID.',
        inputSchema: {
            id: z.string().min(1)
        }
    },
    async ({ id }) => runTool('Blog post deleted.', () => operations.deleteBlogPost({ id }))
);

server.registerTool(
    'admin_list_team_members',
    {
        title: 'List Team Members',
        description: 'List team members with employee login status fields.',
        inputSchema: {}
    },
    async () => runTool('Team members fetched.', () => operations.listTeamMembers())
);

server.registerTool(
    'admin_list_admin_users',
    {
        title: 'List Admin Users',
        description: 'List admin users who can author or review management actions.',
        inputSchema: {}
    },
    async () => runTool('Admin users fetched.', () => operations.listAdminUsers())
);

server.registerTool(
    'admin_list_reports',
    {
        title: 'List Reports',
        description: 'List work reports with optional filters and analytics.',
        inputSchema: {
            status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION']).optional(),
            periodType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
            teamMemberId: z.string().optional(),
            department: z.string().optional()
        }
    },
    async (input) => runTool('Reports fetched.', () => operations.listReports(input))
);

server.registerTool(
    'admin_review_report',
    {
        title: 'Review Report',
        description: 'Approve a report or request revision. Requires the reviewing admin user ID.',
        inputSchema: {
            id: z.string().min(1),
            reviewerId: z.string().min(1),
            status: z.enum(['APPROVED', 'NEEDS_REVISION']),
            feedback: z.string().optional()
        }
    },
    async (input) => runTool('Report reviewed.', () => operations.reviewReport(input))
);

server.registerTool(
    'admin_get_settings',
    {
        title: 'Get Report Settings',
        description: 'Fetch the global report/admin settings record.',
        inputSchema: {}
    },
    async () => runTool('Settings fetched.', () => operations.getSettings())
);

server.registerTool(
    'admin_update_settings',
    {
        title: 'Update Report Settings',
        description: 'Update the global report/admin settings record.',
        inputSchema: {
            dailyCutoffTime: z.string().min(3),
            weeklySummaryDay: z.string().min(3),
            weeklySummaryTime: z.string().min(3),
            emailNotifications: z.boolean(),
            alertRouting: z.boolean()
        }
    },
    async (input) => runTool('Settings updated.', () => operations.updateSettings(input))
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('jontro-admin-mcp running on stdio');
}

main().catch((error) => {
    console.error('MCP server error:', error);
    process.exit(1);
});
