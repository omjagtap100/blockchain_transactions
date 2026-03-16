import 'dotenv/config';
import cron from 'node-cron';
import axios from 'axios';

const BASE_URL = process.env.BACKEND_BASE_URL;
const BACKEND_EMAIL = process.env.BACKEND_EMAIL;
const BACKEND_PASSWORD = process.env.BACKEND_PASSWORD;

let jwtToken = null;

const headers = () => ({
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
});

async function login() {
    console.log('[login] Authenticating with backend...');
    const response = await axios.post(
        `${BASE_URL}/company/access/login`,
        {
            "phone": process.env.BACKEND_PHONE,
            password: BACKEND_PASSWORD,
            "phoneCode": process.env.BACKEND_PHONE_CODE
        }
    );
    const accountId = response.data?.data?.accountId;
    if (!accountId) throw new Error('Login succeeded but no accountId was returned.');
    console.log('[login] Login successful. Account ID:', accountId);
    return accountId;
}

async function verifyOtp(accountId) {
    console.log('[verifyOtp] Verifying OTP...');
    const response = await axios.post(
        `${BASE_URL}/company/access/verify-otp`,
        {
            accountId,
            otp: process.env.BACKEND_OTP,
            phone: process.env.BACKEND_PHONE,
            password: BACKEND_PASSWORD
        },
        { headers: { 'Authorization': headers().Authorization, 'Content-Type': 'application/json' } }
    );
    jwtToken = response.data?.data?.accessToken;
    if (!jwtToken) throw new Error('OTP Verification succeeded but no accessToken was returned.');
    console.log('[verifyOtp] OTP Verification successful. Token acquired.');
}

async function withAuth(fn) {
    try {
        return await fn();
    } catch (error) {
        if (error.response?.status === 401) {
            console.warn('[withAuth] Token expired or invalid. Re-authenticating...');
            const accountId = await login();
            await verifyOtp(accountId);
            return await fn();
        }
        throw error;
    }
}


async function syncContracts() {
    return withAuth(async () => {
        const response = await axios.post(
            `${BASE_URL}/company/transactions/contracts/sync-list`,
            {},
            { headers: headers() }
        );
        const count = response.data?.data?.syncedCount ?? 0;
        console.log(`[syncContracts] Synced ${count} new contracts.`);
        return count;
    }).catch(error => {
        console.error('[syncContracts] Error:', error.response?.data || error.message);
        return 0;
    });
}


async function getContracts() {
    return withAuth(async () => {
        const response = await axios.get(
            `${BASE_URL}/company/transactions/contracts`,
            { headers: headers() }
        );
        const contracts = response.data?.data ?? [];
        console.log(`[getContracts] Found ${contracts.length} contracts.`);
        return contracts;
    }).catch(error => {
        console.error('[getContracts] Error:', error.response?.data || error.message);
        return [];
    });
}


async function syncTransactions({ contractName, cursor }) {
    return withAuth(async () => {
        const response = await axios.post(
            `${BASE_URL}/company/transactions/sync`,
            { contractName, cursor },
            { headers: headers() }
        );
        const { newCount = 0, nextCursor = null } = response.data?.data ?? {};
        return { newCount, nextCursor };
    }).catch(error => {
        console.error(`[syncTransactions] Error for ${contractName}:`, error.response?.data || error.message);
        return { newCount: 0, nextCursor: null };
    });
}

const cursorMap = {};

const runSync = async () => {
    console.log('---- Running transaction sync cron job ----');

    try {
        await syncContracts();

        const contracts = await getContracts();
        console.log(`Processing ${contracts.length} contract(s)...`);

        for (const contract of contracts) {
            const address = contract.address;
            const currentCursor = cursorMap[address] ?? contract.cursor ?? null;

            try {
                console.log(`Syncing ${address} with cursor ${currentCursor}...`);

                const { newCount, nextCursor } = await syncTransactions({
                    contractName: address,
                    cursor: currentCursor
                });

                if (nextCursor && nextCursor !== currentCursor) {
                    cursorMap[address] = nextCursor;
                    console.log(`Updated cursor for ${address} → ${nextCursor}`);
                }

                console.log(`${address}: ${newCount} new transaction(s) synced.`);
            } catch (err) {
                console.error(`Error syncing ${address}:`, err.message);
            }
        }

        console.log('---- Cron job completed ----');
    } catch (error) {
        console.error('Fatal error in cron job:', error.message);
    }
};

const start = async () => {
    if (!BASE_URL) {
        console.error('BACKEND_BASE_URL is not set in .env. Exiting.');
        process.exit(1);
    }
    if (!BACKEND_EMAIL || !BACKEND_PASSWORD) {
        console.error('BACKEND_EMAIL and BACKEND_PASSWORD must be set in .env. Exiting.');
        process.exit(1);
    }

    console.log(`[tridentity-contract-fetching] Starting...`);
    console.log(`Backend URL : ${BASE_URL}`);

    const accountId = await login();
    await verifyOtp(accountId);

    await runSync();

    cron.schedule('*/10 * * * *', runSync);

    console.log('Cron job scheduled (every 10 minutes).');
};

start();
