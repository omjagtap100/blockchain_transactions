import express from 'express';
import { CMTransaction } from '../../entityManagers/company/cmTransaction.js';
import { ApiResponse } from '../../helper/ApiResponse.js';
import { ApiError } from '../../helper/ApiError.js';
import { company_middleware } from './company_middleware.js';

export const company_transaction_api = express.Router();

const ns = `/company/transactions`;


company_transaction_api.get(`${ns}`, company_middleware, async (req, res) => {
    try {
        const { page, pageSize, contractName, fromBlock, toBlock } = req.query;

        await CMTransaction.syncTransactions({ contractName, fromBlock, toBlock });


        const result = await CMTransaction.getTransactions({ page, pageSize });

        res.status(200).send(new ApiResponse(200, result, "Transactions Fetched Successfully"));
    } catch (error) {
        console.error("Transaction API Error:", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).send(error);
        } else {
            res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
        }
    }
});


company_transaction_api.get(`${ns}/:txId`, company_middleware, async (req, res) => {
    try {
        const { txId } = req.params;
        const result = await CMTransaction.getTransactionById(txId);

        if (!result) {
            return res.status(404).send(new ApiError(404, "Transaction not found"));
        }

        res.status(200).send(new ApiResponse(200, result, "Transaction Fetched Successfully"));
    } catch (error) {
        console.error("Get Transaction by ID Error:", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).send(error);
        } else {
            res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
        }
    }
});

company_transaction_api.get(`${ns}/contracts`, company_middleware, async (req, res) => {
    try {
        const result = await CMTransaction.getContracts();
        res.status(200).send(new ApiResponse(200, result, "Contracts Fetched Successfully"));
    } catch (error) {
        console.error("Get Contracts Error:", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).send(error);
        } else {
            res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
        }
    }
});
