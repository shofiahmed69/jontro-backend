const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const invoiceItemSchema = z.object({
    serviceName: z.string().min(1),
    description: z.string().optional().nullable(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    amount: z.number().min(0)
});

const invoiceSchema = z.object({
    invoiceNumber: z.string().optional(),
    clientName: z.string().min(1),
    clientEmail: z.string().email().optional().nullable().or(z.literal('')),
    clientCompany: z.string().optional().nullable(),
    clientAddress: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']).optional(),
    currency: z.string().default('USD'),
    items: z.array(invoiceItemSchema).min(1),
    subtotal: z.number().min(0),
    tax: z.number().min(0).default(0),
    discount: z.number().min(0).default(0),
    totalAmount: z.number().min(0),
    notes: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    issueDate: z.string().optional().nullable()
});

// Helper: Generate timestamp-based official invoice number (e.g., INV-20260805-7842)
function generateInvoiceNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV-${dateStr}-${randomSuffix}`;
}

// Admin: List all invoices
router.get('/', auth, async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where = {};
        if (status && ['DRAFT', 'SENT', 'PAID', 'CANCELLED'].includes(status)) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { clientName: { contains: search, mode: 'insensitive' } },
                { clientCompany: { contains: search, mode: 'insensitive' } },
                { clientEmail: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.invoice.count({ where })
        ]);

        res.json({
            success: true,
            data: invoices,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / take)
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Get invoice by ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.id }
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
});

// Admin: Create invoice
router.post('/', auth, validate(invoiceSchema), async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (!body.invoiceNumber) {
            body.invoiceNumber = generateInvoiceNumber();
        }
        if (body.issueDate) {
            body.issueDate = new Date(body.issueDate);
        } else {
            body.issueDate = new Date();
        }
        if (body.dueDate) {
            body.dueDate = new Date(body.dueDate);
        }

        const invoice = await prisma.invoice.create({
            data: body
        });

        // Optionally record in ledger as Income if status is PAID or SENT
        if (body.status === 'PAID') {
            await prisma.transaction.create({
                data: {
                    title: `Invoice Payment: ${invoice.invoiceNumber} (${invoice.clientName})`,
                    amount: invoice.totalAmount,
                    type: 'INCOME',
                    category: 'Project Payment',
                    reference: invoice.invoiceNumber,
                    note: `Automatic ledger entry for invoice ${invoice.invoiceNumber}`,
                    date: invoice.issueDate
                }
            }).catch(e => console.error("Failed to auto-create transaction for invoice:", e));
        }

        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
});

// Admin: Update invoice
router.put('/:id', auth, validate(invoiceSchema), async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (body.issueDate) body.issueDate = new Date(body.issueDate);
        if (body.dueDate) body.dueDate = new Date(body.dueDate);

        const updated = await prisma.invoice.update({
            where: { id: req.params.id },
            data: body
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Admin: Update invoice status (e.g. mark as PAID / SENT / CANCELLED)
router.patch('/:id/status', auth, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['DRAFT', 'SENT', 'PAID', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid invoice status' });
        }

        const invoice = await prisma.invoice.update({
            where: { id: req.params.id },
            data: { status }
        });

        if (status === 'PAID') {
            await prisma.transaction.create({
                data: {
                    title: `Invoice Payment: ${invoice.invoiceNumber} (${invoice.clientName})`,
                    amount: invoice.totalAmount,
                    type: 'INCOME',
                    category: 'Project Payment',
                    reference: invoice.invoiceNumber,
                    note: `Automatic ledger entry for invoice ${invoice.invoiceNumber}`,
                    date: new Date()
                }
            }).catch(e => console.error("Failed to auto-create transaction:", e));
        }

        res.json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
});

// Admin: Delete invoice
router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.invoice.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
