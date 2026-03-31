const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { generateSlug } = require('../services/slugService');

const router = express.Router();

const blogSchema = z.object({
    title: z.string().min(5).max(200),
    slug: z.string().min(3).max(200).optional(),
    excerpt: z.string().min(20).max(500),
    content: z.string().min(100),
    heroImage: z.string().url().optional(),
    category: z.string().max(60),
    tags: z.array(z.string()).optional(),
    authorId: z.string().uuid(),
    readTime: z.number().int().min(1),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
});

// Public: List published posts
router.get('/', async (req, res, next) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where = { published: true };
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                skip,
                take,
                orderBy: { publishedAt: 'desc' },
                include: { author: { select: { name: true, avatar: true } } }
            }),
            prisma.blogPost.count({ where })
        ]);

        res.json({
            posts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Admin: List all posts (with pagination)
router.get('/admin', auth, async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: { author: { select: { name: true } } }
            }),
            prisma.blogPost.count()
        ]);

        res.json({
            posts,
            totalPages: Math.ceil(total / take),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        next(error);
    }
});

// Admin: CRUD
router.post('/', auth, validate(blogSchema), async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (!data.slug) data.slug = generateSlug(data.title);

        const post = await prisma.blogPost.create({ data });
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, validate(blogSchema), async (req, res, next) => {
    try {
        const post = await prisma.blogPost.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(post);
    } catch (error) {
        next(error);
    }
});

// Public: Get post by slug
router.get('/:slug', async (req, res, next) => {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: req.params.slug, published: true },
            include: { author: { select: { name: true, avatar: true, bio: true } } }
        });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.blogPost.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// Public: Submit a post for review
router.post('/submit', validate(blogSchema), async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (!data.slug) data.slug = generateSlug(data.title);
        data.published = false; // Force unpublished

        const post = await prisma.blogPost.create({ data });
        res.status(201).json({ message: 'Submission received for review', post });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
