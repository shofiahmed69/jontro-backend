const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Higher ceiling to avoid throttling active admin sessions
    message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, try again later' }
});

const leadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many contact form submissions, try again later' }
});

module.exports = { globalLimiter, authLimiter, leadLimiter };
