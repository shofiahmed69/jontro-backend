const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth failed: No Bearer token');
            return res.status(401).json({
                error: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        console.log('Auth success:', decoded.email);
        next();

    } catch (error) {
        console.error('JWT Error:', error.message);
        return res.status(403).json({
            error: 'Session expired. Please login again.',
            code: 'TOKEN_INVALID'
        });
    }
};

