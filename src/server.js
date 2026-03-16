const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
});
