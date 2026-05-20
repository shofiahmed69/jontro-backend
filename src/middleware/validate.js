const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(422).json({
                errors: result.error.flatten().fieldErrors,
                received: req.body
            });
        }

        req.body = result.data;
        next();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal validation error' });
    }
};

module.exports = validate;
