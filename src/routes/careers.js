const express = require('express');
const { z } = require('zod');
const multer = require('multer');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { uploadResume } = require('../services/fileService');
const { sendApplicationNotification, sendApplicationConfirmation } = require('../services/emailService');

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

const jobListingSchema = z.object({
    title: z.string(),
    department: z.string(),
    type: z.string(),
    location: z.string(),
    description: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(z.string()),
    niceToHave: z.array(z.string()).optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    published: z.boolean().optional(),
    closingDate: z.string().optional(),
});

const applicationSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    coverLetter: z.string().optional(),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    linkedIn: z.string().url().optional().or(z.literal('')),
});

// Public: List jobs
router.get('/', async (req, res, next) => {
    try {
        const jobs = await prisma.jobListing.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

// Public: Apply to a job
router.post('/:id/apply', upload.single('resume'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Resume is required' });

        // Validate other fields
        const data = applicationSchema.parse(req.body);

        // Upload to Supabase
        const resumeUrl = await uploadResume(req.file.buffer, req.file.originalname, req.file.mimetype);

        // Fetch job title for the notification
        const job = await prisma.jobListing.findUnique({
            where: { id: req.params.id },
            select: { title: true }
        });
        const jobTitle = job ? job.title : 'Open Application';

        const application = await prisma.jobApplication.create({
            data: {
                ...data,
                resumeUrl,
                jobId: req.params.id
            }
        });

        // Email notifications
        sendApplicationNotification(application, jobTitle).catch(console.error);
        sendApplicationConfirmation(application).catch(console.error);

        res.status(201).json(application);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(422).json({ errors: error.flatten().fieldErrors });
        }
        next(error);
    }
});

// Admin: CRUD Job Listings
router.post('/admin', auth, validate(jobListingSchema), async (req, res, next) => {
    try {
        const job = await prisma.jobListing.create({ data: req.body });
        res.status(201).json(job);
    } catch (error) {
        next(error);
    }
});

router.get('/admin/applications', auth, async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [applications, total] = await Promise.all([
            prisma.jobApplication.findMany({
                include: { job: { select: { title: true } } },
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.jobApplication.count()
        ]);

        res.json({
            applications,
            totalPages: Math.ceil(total / take),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        next(error);
    }
});

router.get('/admin/jobs', auth, async (req, res, next) => {
    try {
        const jobs = await prisma.jobListing.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        next(error);
    }
});

router.put('/admin/:id', auth, validate(jobListingSchema), async (req, res, next) => {
    try {
        const job = await prisma.jobListing.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(job);
    } catch (error) {
        next(error);
    }
});

router.delete('/admin/:id', auth, async (req, res, next) => {
    try {
        await prisma.jobListing.delete({
            where: { id: req.params.id }
        });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
