import express from 'express';
import { CMTransaction } from '../../entityManagers/company/cmTransaction.js';
import { ApiResponse } from '../../helper/ApiResponse.js';
import { ApiError } from '../../helper/ApiError.js';
import { company_middleware } from './company_middleware.js';

export const company_transaction_api = express.Router();

const ns = `/company/transactions`;


company_transaction_api.get(`${ns}`, company_middleware, async (req, res) => {
    try {
        const { page, pageSize, contractName } = req.query;

        const result = await CMTransaction.getTransactions({ page, pageSize, contractName });

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


company_transaction_api.get(`${ns}/block-range`, company_middleware, async (req, res) => {
    try {
        const { startHeight, endHeight, blockHeight } = req.query;
        let result;
        if (blockHeight) {
            result = await CMTransaction.fetchBlockRangeInfo({ blockHeight });
        } else {
            result = await CMTransaction.fetchBlockRangeInfo({ startHeight, endHeight });
        }
        res.status(200).send(new ApiResponse(200, result, "Block Range Info Fetched Successfully"));
    } catch (error) {
        console.error("Get Block Range Error:", error);
        res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
    }
});

company_transaction_api.get(`${ns}/contracts/logs`, company_middleware, async (req, res) => {
    try {
        const { contractName, fromBlock } = req.query;
        if (!contractName) {
            return res.status(400).send(new ApiError(400, "contractName is required"));
        }

        const result = await CMTransaction.fetchContractLogs({
            contractName,
            fromBlock: fromBlock ? parseInt(fromBlock) : 0

        });

        res.status(200).send(new ApiResponse(200, result, "Contract Logs Fetched Successfully"));
    } catch (error) {
        console.error("Get Contract Logs Error:", error);
        res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
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

/**
 * POST /company/transactions/contracts/sync-list
 * Fetches contracts from the external getContractList API using paginated offsets,
 * stores new ones in the contracts table, and persists the offset in app_configs.
 */
company_transaction_api.post(`${ns}/contracts/sync-list`, company_middleware, async (req, res) => {
    try {
        const result = await CMTransaction.syncContractListWithOffset();
        res.status(200).send(new ApiResponse(200, result, "Contract List Synced Successfully"));
    } catch (error) {
        console.error("Sync Contract List Error:", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).send(error);
        } else {
            res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
        }
    }
});

company_transaction_api.get(`${ns}/block-height`, company_middleware, async (req, res) => {
    try {
        const result = await CMTransaction.fetchCurrentBlockHeight();
        res.status(200).send(new ApiResponse(200, result, "Current Block Height Fetched Successfully"));
    } catch (error) {
        console.error("Get Block Height Error:", error);
        res.status(500).send(new ApiError(500, "Internal Server Error", [error.message]));
    }
});

company_transaction_api.get(`${ns}/search`, company_middleware, async (req, res) => {
    try {
        const { query, page, pageSize } = req.query;

        if (!query) {
            return res.status(400).send(new ApiError(400, "Search query is required"));
        }

        const result = await CMTransaction.searchTransactions({ query, page, pageSize });

        res.status(200).send(new ApiResponse(200, result, "Search Results Fetched Successfully"));
    } catch (error) {
        console.error("Search API Error:", error);
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

