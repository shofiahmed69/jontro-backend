const axios = require('axios');

const API_URL = 'http://localhost:4000/api';
let authToken = '';

async function runTests() {
    console.log('🧪 Starting API Verification Tests...');

    try {
        // 1. Health Check
        console.log('\n🏥 Testing Health Check...');
        const health = await axios.get(`${API_URL}/health`);
        console.log('✅ Health Check:', health.data);

        // 2. Authentication (Login)
        console.log('\n🔐 Testing Admin Login...');
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@jontro.com',
            password: 'admin123'
        });
        authToken = login.data.token;
        console.log('✅ Login Successful. Token received.');

        // 3. Leads (Submit)
        console.log('\n📝 Testing Lead Submission...');
        const lead = await axios.post(`${API_URL}/leads`, {
            name: 'Test User',
            email: 'test@example.com',
            service: 'AI Agent Development',
            budget: '$15K-$50K',
            description: 'This is a test lead submission to verify the API.'
        });
        console.log('✅ Lead Submitted successfully. Status:', lead.status);

        // 4. Admin: List Leads (Protected)
        console.log('\n📋 Testing Admin List Leads (Protected)...');
        const leadsList = await axios.get(`${API_URL}/leads/admin`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Leads retrieved successfully. Count:', leadsList.data.leads.length);

        // 5. Blog: List (Empty)
        console.log('\n📰 Testing Blog List...');
        const blogs = await axios.get(`${API_URL}/blog`);
        console.log('✅ Blog list retrieved. Count:', blogs.data.posts.length);

        // 6. Stats: List (Empty)
        console.log('\n📊 Testing Stats List...');
        const stats = await axios.get(`${API_URL}/stats`);
        console.log('✅ Stats list retrieved. Count:', stats.data.length);

        console.log('\n🎉 All core API tests PASSED perfectly!');

    } catch (error) {
        console.error('\n❌ API Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
