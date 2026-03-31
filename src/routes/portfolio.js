const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authMiddleware = require('../middleware/auth')

// PUBLIC - get all published projects
router.get('/', async (req, res) => {
    try {
        const { category, featured } = req.query
        const where = { published: true }
        if (featured === 'true') where.featured = true
        if (category) where.category = { has: category }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { order: 'asc' }
        })
        res.json({ success: true, data: projects })
    } catch (error) {
        console.error('Projects error:', error)
        res.status(500).json({ error: error.message })
    }
})

// PUBLIC - get featured projects for home page
router.get('/featured', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { published: true, featured: true },
            orderBy: { order: 'asc' },
            take: 3
        })
        res.json({ success: true, data: projects })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// PUBLIC - get single project by slug
router.get('/:slug', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { slug: req.params.slug }
        })
        if (!project) {
            return res.status(404).json({ error: 'Not found' })
        }
        res.json({ success: true, data: project })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ADMIN - get all projects including unpublished
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        })
        res.json({ success: true, data: projects })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ADMIN - create project
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            title, slug, client, thumbnail,
            category, challenge, approach,
            features, techStack, results,
            featured, published, order
        } = req.body

        const project = await prisma.project.create({
            data: {
                title,
                slug: slug || title.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, ''),
                client: client || '',
                thumbnail: thumbnail || '',
                category: category || [],
                challenge: challenge || '',
                approach: approach || '',
                features: features || [],
                techStack: techStack || [],
                results: results || '',
                featured: featured || false,
                published: published || false,
                order: order || 0
            }
        })
        res.status(201).json({ success: true, data: project })
    } catch (error) {
        console.error('Create project error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ADMIN - update project
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: req.body
        })
        res.json({ success: true, data: project })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ADMIN - toggle published
router.patch('/:id/publish', authMiddleware,
    async (req, res) => {
        try {
            const project = await prisma.project.findUnique({
                where: { id: req.params.id }
            })
            const updated = await prisma.project.update({
                where: { id: req.params.id },
                data: { published: !project.published }
            })
            res.json({ success: true, data: updated })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

// ADMIN - delete project
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.project.delete({
            where: { id: req.params.id }
        })
        res.json({ success: true, message: 'Project deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
