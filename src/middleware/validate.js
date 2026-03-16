const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            console.log('VALIDATION FAILED:', JSON.stringify(result.error.flatten(), null, 2));
            return res.status(422).json({
                errors: result.error.flatten().fieldErrors,
                received: req.body
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
