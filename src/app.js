const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalLimiter } = require('./middleware/rateLimiter');
const env = require('./config/env');

const app = express();
app.set('trust proxy', 1);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
}));

app.options('*', cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(globalLimiter);

app.use('/uploads', express.static('/app/uploads'));

const prisma = require('./services/db');

app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            deployedAt: '2026-04-03 20:00:00',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(200).json({
            status: 'ok',
            database: 'disconnected',
            deployedAt: '2026-04-03 20:00:00',
            message: 'Database unavailable',
            timestamp: new Date().toISOString()
        });
    }
});

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const blogRoutes = require('./routes/blog');
const workPublicRoutes = require('./routes/work-public');
const workAdminRoutes = require('./routes/work-admin');
const careersRoutes = require('./routes/careers');
const serviceRoutes = require('./routes/services');
const testimonialRoutes = require('./routes/testimonials');
const teamRoutes = require('./routes/team');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const reportRoutes = require('./routes/reports');
const migrateRoutes = require('./routes/migrate');
const auth = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin/leads', auth, leadRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/work', workPublicRoutes);
app.use('/api/admin/work', auth, workAdminRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/migrate', migrateRoutes);


app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        error: status >= 500 ? 'Internal Server Error' : (err.message || 'Request failed'),
        errors: err.errors
    });
});

module.exports = app;
