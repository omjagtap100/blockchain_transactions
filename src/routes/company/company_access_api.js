import express from 'express';
import { CMAuth } from '../../entityManagers/company/cmAuth.js';
import { ApiResponse } from '../../helper/ApiResponse.js';
import { ApiError } from '../../helper/ApiError.js';

export const company_access_api = express.Router();

const ns = `/company/access`;


company_access_api.post(`${ns}/login`, async (req, res) => {
    try {
        const { phone, email, password, fcmToken, deviceId, sourceIp, phoneCode, otp } = req.body;

        const result = await CMAuth.login({ phone, email, password, fcmToken, deviceId, sourceIp, phoneCode, otp });
        res.status(200).send(new ApiResponse(200, result, "Login Successful"));
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).send(error);
        } else {
            console.error("Login Error:", error);
            res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
        }
    }
});


company_access_api.post(`${ns}/dummy-user`, async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password } = req.body;
        const result = await CMAuth.createDummyUser({ firstName, lastName, phone, email, password });
        res.status(200).send(new ApiResponse(200, result, "User Created Successfully"));
    } catch (error) {
        console.error("Create User Error:", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).send(error);
        } else {
            res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
        }
    }
});
