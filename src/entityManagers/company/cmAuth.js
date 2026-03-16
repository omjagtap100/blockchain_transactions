import { MODELS } from '../../sequelize.js';
import { generate_JWT } from '../../routes/helper/JWTHelper.js';
import dotenv from 'dotenv';
dotenv.config();
import { ApiError } from '../../helper/ApiError.js';
import { comparePassword, hashPassword } from '../../routes/helper/PasswordHelper.js';
const axios = (await import('axios')).default;
export class CMAuth {

    static async login({ phone, email, password, fcmToken, deviceId, sourceIp, phoneCode, otp }) {
        if ((!phone && !email) || !password) {
            throw new ApiError(400, "Phone/Email and Password are required");
        }

        const baseUrl = process.env.TRIAPP_BASE_URL || 'https://triapp-api-staging.tribox.me';
        const externalAppId = process.env.EXTERNAL_AUTH_APP_ID || '';
        const externalApiKey = process.env.EXTERNAL_AUTH_API_KEY || '';



        let accountId = null;

        // Step 1: Login
        try {
            if (email) {
                const loginRes = await axios.post(`${baseUrl}/api/auth/login/email`, {
                    email,
                    password,
                    fcmToken: fcmToken || null,
                    deviceId: deviceId || "1242535325",
                    sourceIp: sourceIp || "123.366.34.676"
                }, {
                    headers: {
                        'app-version': '1.0',
                        'app-platform': '0',
                        'Content-Type': 'application/json',
                        'app-id': externalAppId,
                        'api-key': externalApiKey
                    }
                });
                accountId = loginRes.data?.data?.accountId;
            } else if (phone) {
                const loginRes = await axios.post(`${baseUrl}/api/auth/login/phone`, {
                    phone,
                    password,
                    phoneCode: phoneCode || "65",
                    fcmToken: fcmToken || "No FCM Token"
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'app-id': externalAppId,
                        'api-key': externalApiKey
                    }
                });
                accountId = loginRes.data?.data?.accountId;
                return loginRes.data?.data;
            }
        } catch (err) {
            console.error("External Login Error:", err?.response?.data || err.message);
            throw new ApiError(401, "External Login Failed");
        }

    }
    static async verifyOTP(accountId, otp, phone, email, password) {
        const baseUrl = process.env.TRIAPP_BASE_URL || 'https://triapp-api-staging.tribox.me';
        const externalAppId = process.env.EXTERNAL_AUTH_APP_ID || '';
        const externalApiKey = process.env.EXTERNAL_AUTH_API_KEY || '';
        if (!accountId) {
            throw new ApiError(401, "Login failed: Account ID not found from external API");
        }
        // Step 2: Verify OTP
        let externalAccessToken, externalRefreshToken;
        try {
            const verifyRes = await axios.post(`${baseUrl}/api/auth/login/verify-otp`, {
                accountId,
                otp: otp || "111111"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'app-id': externalAppId,
                    'api-key': externalApiKey
                }
            });
            externalAccessToken = verifyRes.data?.data?.accessToken;
            externalRefreshToken = verifyRes.data?.data?.refreshToken;
        } catch (err) {
            console.error("External Verify OTP Error:", err?.response?.data || err.message);
            throw new ApiError(401, "OTP Verification Failed");
        }

        if (!externalAccessToken) {
            throw new ApiError(401, "OTP Verification failed: No access token returned");
        }

        const authHeader = `Bearer ${externalAccessToken}`;

        // Step 3: Get Auth Token
        let authToken;
        try {
            const tokenRes = await axios.post(`${baseUrl}/api/auth/token?appId=${externalAppId}`, {}, {
                headers: { 'Authorization': authHeader }
            });
            authToken = tokenRes.data?.data?.token;
        } catch (err) {
            console.error("External Get Auth Token Error:", err?.response?.data || err.message);
            throw new ApiError(401, "Get Auth Token Failed");
        }

        // Step 4: Verify Auth Token -> Get Identity Token
        let identityToken;
        try {
            const verifyTokenRes = await axios.post(`${baseUrl}/api/external/auth/token/verify`, {
                authToken
            }, {
                headers: {
                    'app-id': externalAppId,
                    'api-key': externalApiKey,
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                }
            });
            identityToken = verifyTokenRes.data?.data?.user?.identityToken;
        } catch (err) {
            console.error("External Verify Token Error:", err?.response?.data || err.message);
            throw new ApiError(401, "Verify Token Failed");
        }

        // Step 5: Get Profile
        let profileData;
        try {
            const profileRes = await axios.get(`${baseUrl}/api/external/user/profile?scopes=wallet`, {
                headers: {
                    'app-id': externalAppId,
                    'api-key': externalApiKey,
                    'identity-token': identityToken,
                    'Authorization': authHeader
                }
            });
            profileData = profileRes.data?.data;
        } catch (err) {
            console.error("External Profile Error:", err?.response?.data || err.message);
            throw new ApiError(401, "Failed to get User Profile");
        }

        const externalUserId = profileData?.user?.userId;
        const username = profileData?.user?.username?.trim();
        const membershipId = profileData?.user?.membershipId;
        const walletId = profileData?.wallet?.walletId;
        const walletAddress = profileData?.wallet?.walletAddress;

        if (!externalUserId) {
            throw new ApiError(500, "Profile data missing userId");
        }

        const { User, Jwt } = MODELS;

        const whereClause = {};
        if (phone) whereClause.phone = phone;
        if (email) whereClause.email = email;

        // Upsert the user into the local database
        let user = await User.findOne({ where: whereClause });
        if (user) {
            await user.update({
                accountId,
                externalUserId: externalUserId.toString(),
                username,
                membershipId,
                walletId,
                walletAddress,
                externalAccessToken,
                externalRefreshToken
            });
        } else {

            const hashedPassword = await hashPassword(password);
            user = await User.create({
                phone: phone || null,
                email: email || null,
                password: hashedPassword,
                accountId,
                externalUserId: externalUserId.toString(),
                username,
                membershipId,
                walletId,
                walletAddress,
                externalAccessToken,
                externalRefreshToken,
                status: 'ACTIVE'
            });
        }

        // Create internal local JWT for the client app to continue interacting with this specific node/backend
        const { accessToken } = generate_JWT(user);
        const existingJwt = await Jwt.findOne({ where: { userId: user.id } });

        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 150);

        if (existingJwt) {
            await existingJwt.update({
                token: accessToken,
                expire: expireDate
            });
        } else {
            await Jwt.create({
                token: accessToken,
                userId: user.id,
                expire: expireDate,
                status: 'ACTIVE'
            });
        }



        return {
            user,
            accessToken
        };
    }



    static async createDummyUser({ firstName, lastName, phone, email, password }) {
        const { User } = MODELS;
        const hashedPassword = await hashPassword(password);
        return await User.create({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            status: 'ACTIVE'
        });
    }

    static async checkJwt(token, custId) {
        const { Jwt } = MODELS;

        const jwtRecord = await Jwt.findOne({
            where: {
                token,
            },
        });

        if (jwtRecord) {
            return true;
        }
        return false;
    }

    static async profile(querier) {
        const userId = querier?.claims?.id;
        const { User } = MODELS;
        const user = await User.findByPk(userId);
        return user ? user.get({ plain: true }) : null;
    }
}
