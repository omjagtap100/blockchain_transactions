import axios from 'axios';

const API_URL = 'http://localhost:3000';

(async () => {
    try {
        console.log('Creating unique user for test...');
        const unique = `tx_test_${Math.floor(Math.random() * 100000)}`;
        const email = `${unique}@example.com`;
        const phone = `${Math.floor(Math.random() * 1000000000)}`;

        await axios.post(`${API_URL}/company/access/dummy-user`, {
            firstName: "Tx",
            lastName: "Tester",
            phone: phone,
            email: email,
            password: "securepassword"
        });

        console.log('Login to get token...');
        const loginRes = await axios.post(`${API_URL}/company/access/login`, {
            email: email,
            password: 'securepassword'
        });
        const token = loginRes.data.data.accessToken;
        console.log('Access Token obtained');

        console.log('\nTesting Transaction API (Sync & Get)...');
        const txnRes = await axios.get(`${API_URL}/company/transactions?page=1&pageSize=5`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(' Status:', txnRes.status);
        console.log(' Data:', txnRes.data);

        if (txnRes.data.data.items.length > 0) {
            console.log(` Items returned: ${txnRes.data.data.items.length}`);
            console.log(' First Item ID:', txnRes.data.data.items[0].txId);
        } else {
            console.error(' No items returned.');
        }

    } catch (error) {
        console.error(' Test Failed:', error.response ? error.response.data : error.message);
    }
})();
