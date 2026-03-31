const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalLimiter } = require('./middleware/rateLimiter');
const env = require('./config/env');

const app = express();
app.set('trust proxy', 1);

// 1. CORS MUST BE FIRST
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
}));

// 2. Pre-flight requests
app.options('*', cors());

// 3. Manual Fallback Headers (Guarantees success on all origins)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 4. Other Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(globalLimiter);

const prisma = require('./services/db');

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(200).json({
            status: 'ok',
            database: 'disconnected',
            message: error.message,
            timestamp: new Date().toISOString()
        })
    }
});

// Import Routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const blogRoutes = require('./routes/blog');
const portfolioRoutes = require('./routes/portfolio');
const careersRoutes = require('./routes/careers');
const serviceRoutes = require('./routes/services');
const testimonialRoutes = require('./routes/testimonials');
const teamRoutes = require('./routes/team');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
const auth = require('./middleware/auth');
app.use('/api/admin/leads', auth, leadRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/work', portfolioRoutes);
app.use('/api/admin/work', portfolioRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        errors: err.errors
    });
});

module.exports = app;
