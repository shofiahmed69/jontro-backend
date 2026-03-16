const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        req.body = result.data;
        next();
    } catch (error) {
        console.error('Validation Middleware Error:', error);
        res.status(500).json({ success: false, error: 'Internal validation error' });
    }
};

module.exports = validate;
