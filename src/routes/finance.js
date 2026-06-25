const express = require('express');
const { z } = require('zod');
const prisma = require('../services/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

const transactionSchema = z.object({
    title: z.string().min(1),
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1),
    reference: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    date: z.string().transform((val) => new Date(val)).optional()
});

// Admin: Get transactions and summary statistics
router.get('/', auth, async (req, res, next) => {
    try {
        const { type, category, search, startDate, endDate, page = 1, limit = 50 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where = {};

        if (type && (type === 'INCOME' || type === 'EXPENSE')) {
            where.type = type;
        }

        if (category && category !== 'all' && category !== '') {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { reference: { contains: search, mode: 'insensitive' } },
                { note: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }

        // Fetch transactions, count, and aggregates (stats)
        const [transactions, total, summary] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take,
                orderBy: { date: 'desc' }
            }),
            prisma.transaction.count({ where }),
            prisma.transaction.groupBy({
                by: ['type'],
                where,
                _sum: {
                    amount: true
                }
            })
        ]);

        // Calculate stats for response
        let totalIncome = 0;
        let totalExpense = 0;

        summary.forEach(group => {
            if (group.type === 'INCOME') {
                totalIncome = group._sum.amount || 0;
            } else if (group.type === 'EXPENSE') {
                totalExpense = group._sum.amount || 0;
            }
        });

        // Also calculate overall stats without pagination filters (except date range if applicable)
        const overallSummary = await prisma.transaction.groupBy({
            by: ['type'],
            _sum: {
                amount: true
            }
        });

        let overallIncome = 0;
        let overallExpense = 0;

        overallSummary.forEach(group => {
            if (group.type === 'INCOME') {
                overallIncome = group._sum.amount || 0;
            } else if (group.type === 'EXPENSE') {
                overallExpense = group._sum.amount || 0;
            }
        });

        res.json({
            success: true,
            data: transactions,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / take),
            stats: {
                filtered: {
                    income: totalIncome,
                    expense: totalExpense,
                    balance: totalIncome - totalExpense
                },
                overall: {
                    income: overallIncome,
                    expense: overallExpense,
                    balance: overallIncome - overallExpense
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Get monthly aggregation for charting
router.get('/charts', auth, async (req, res, next) => {
    try {
        // Query transactions from the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1); // start of month
        sixMonthsAgo.setHours(0,0,0,0);

        const transactions = await prisma.transaction.findMany({
            where: {
                date: {
                    gte: sixMonthsAgo
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Group by month
        const monthlyData = {};

        // Pre-fill last 6 months to ensure they show up in chart even if empty
        const tempDate = new Date(sixMonthsAgo);
        for (let i = 0; i < 7; i++) {
            const label = tempDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyData[label] = { month: label, income: 0, expense: 0 };
            tempDate.setMonth(tempDate.getMonth() + 1);
        }

        transactions.forEach(tx => {
            const label = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[label]) {
                monthlyData[label] = { month: label, income: 0, expense: 0 };
            }
            if (tx.type === 'INCOME') {
                monthlyData[label].income += tx.amount;
            } else {
                monthlyData[label].expense += tx.amount;
            }
        });

        res.json({
            success: true,
            data: Object.values(monthlyData)
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Add a new transaction
router.post('/', auth, validate(transactionSchema), async (req, res, next) => {
    try {
        const transaction = await prisma.transaction.create({
            data: req.body
        });
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Update a transaction
router.put('/:id', auth, validate(transactionSchema), async (req, res, next) => {
    try {
        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Delete a transaction
router.delete('/:id', auth, async (req, res, next) => {
    try {
        await prisma.transaction.delete({
            where: { id: req.params.id }
        });
        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
