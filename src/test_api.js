import axios from 'axios';

const API_URL = 'http://localhost:3000';

(async () => {
    try {
        console.log('Creating Dummy User...');
        const uniquePhone = `999${Math.floor(Math.random() * 10000000)}`;
        const dummyUser = {
            firstName: "Test",
            lastName: "User",
            phone: uniquePhone,
            email: `test${uniquePhone}@example.com`,
            password: "securePassword123"
        };

        const createRes = await axios.post(`${API_URL}/company/access/dummy-user`, dummyUser);
        console.log('✅ User Created:', createRes.data.data.id);

        console.log('\nTesting Login with New User...');
        const loginRes = await axios.post(`${API_URL}/company/access/login`, {
            phone: uniquePhone,
            password: "securePassword123"
        });

        if (loginRes.data.data.accessToken) {
            console.log('✅ Login Success with Hashed Password');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
})();
