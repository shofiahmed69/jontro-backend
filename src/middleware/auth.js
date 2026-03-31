const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header received:',
            authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING');
        console.log('JWT_SECRET available:',
            !!process.env.JWT_SECRET);
        console.log('JWT_SECRET length:',
            process.env.JWT_SECRET?.length);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.admin = decoded;
        console.log('JWT verified for:', decoded.email);
        next();

    } catch (error) {
        console.error('JWT verify failed:', error.message);
        return res.status(403).json({
            error: 'Session expired. Please login again.'
        });
    }
};
