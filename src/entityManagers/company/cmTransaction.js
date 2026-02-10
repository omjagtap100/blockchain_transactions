import { MODELS } from '../../sequelize.js';
import { ApiError } from '../../helper/ApiError.js';
import { HashingService } from '../../helper/HashingService.js';
import axios from 'axios';

export class CMTransaction {


    static async fetchFromExternalSource(params) {
        try {
            const url = process.env.EXTERNAL_TRANSACTION_API_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;


            const currentBlockHeight = await this.fetchCurrentBlockHeight();
            const toBlock = currentBlockHeight || 100000000;

            const data = {
                contractName: params.contractName,
                fromBlock: 0,
                toBlock: toBlock,
                cursor: params.cursor || null
            };

            const hashkey = await HashingService.generateHash(null, data, secretKey);

            const payload = {
                data,
                hashkey
            };

            const headers = {
                'appid': appid,
                'sid': sid,
                'Content-Type': 'application/json'
            };

            const response = await axios.post(url, payload, { headers });

            const resData = response.data.data || response.data;
            const transactions = resData.transactions || [];
            const contractName = resData.contractName || params.contractName;
            const nextCursor = resData.nextCursor;

            return { transactions, contractName, nextCursor };
        } catch (error) {
            console.error('Error fetching transactions from external source:', error.message);
            return { transactions: [], contractName: params.contractName, nextCursor: null };
        }
    }

    static async fetchContractLogs(params) {
        try {
            const url = process.env.EXTERNAL_CONTRACT_LOGS_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;


            let toBlock = params.toBlock;
            if (!toBlock) {
                const currentHeight = await this.fetchCurrentBlockHeight();
                toBlock = currentHeight || 100000000;
            }

            const data = {
                contractName: params.contractName,
                fromBlock: params.fromBlock || 0,
                toBlock: toBlock
            };

            const hashkey = await HashingService.generateHash(null, data, secretKey);

            const payload = {
                data,
                hashkey
            };

            const headers = {
                'appid': appid,
                'sid': sid,
                'Content-Type': 'application/json'
            };

            const response = await axios.post(url, payload, { headers });

            if (response.data && response.data.ok && response.data.data) {
                return response.data.data;
            }
            return { transfers: [], message: "No data found or error in response" };

        } catch (error) {
            console.error('Error fetching contract logs:', error.message);
            throw error;
        }
    }

    static async fetchCurrentBlockHeight() {
        try {
            const baseUrl = process.env.EXTERNAL_BLOCK_HEIGHT_API_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;

            const data = {
                action: "getCurrentBlockHeight"
            };

            const hashkey = await HashingService.generateHash(null, data, secretKey);

            const payload = {
                data,
                hashkey
            };

            const headers = {
                'appid': appid,
                'sid': sid,
                'Content-Type': 'application/json'
            };

            const response = await axios.post(baseUrl, payload, { headers });

            if (response.data && response.data.ok && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching current block height:', error.message);
            return null;
        }
    }

    static async fetchContractsFromExternalSource() {
        try {
            const url = `${process.env.CONNECTOR_URL}/contracts`;
            const response = await axios.get(url);

            if (response.data && response.data.contracts) {
                return response.data.contracts;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching contracts from external source:', error.message);
            return [];
        }
    }

    static async syncTransactions(params = {}) {
        const { transactions, contractName: respContractName, nextCursor } = await this.fetchFromExternalSource(params);
        const { Transaction, Contract } = MODELS;


        const allContracts = await Contract.findAll();
        const contractMap = {};
        allContracts.forEach(c => {
            contractMap[c.address] = c.id;
        });

        let newCount = 0;
        for (const tx of transactions) {

            const effectiveContractName = tx.contractName || respContractName;
            const cId = contractMap[effectiveContractName];

            const gasUsed = (tx.gasUsed === "N/A" || isNaN(tx.gasUsed)) ? 0 : parseInt(tx.gasUsed);

            const [record, created] = await Transaction.findOrCreate({
                where: { txId: tx.txId },
                defaults: {
                    ...tx,
                    contractName: effectiveContractName,
                    contractId: cId || null,
                    gasUsed: gasUsed
                }
            });
            if (created) newCount++;
        }
        console.log(`Synced: ${newCount} new transactions. Next Cursor: ${nextCursor}`);
        return { newCount, nextCursor };
    }

    static async syncContracts() {
        const contracts = await this.fetchContractsFromExternalSource();
        const { Contract } = MODELS;

        let newCount = 0;
        for (const contract of contracts) {
            const [record, created] = await Contract.findOrCreate({
                where: { address: contract.address },
                defaults: {
                    name: contract.name,
                    address: contract.address
                }
            });
            if (created) newCount++;
        }
        console.log(`Synced: ${newCount} new contracts.`);
        return newCount;
    }

    static async getTransactions({ page = 1, pageSize = 10, contractName }) {
        const { Transaction } = MODELS;
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;
        const whereClause = {};

        if (contractName) {
            whereClause.contractName = contractName;
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['timestamp', 'DESC']]
        });

        return {
            totalItems: count,
            items: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    }
    static async getTransactionById(txId) {
        const { Transaction } = MODELS;
        const transaction = await Transaction.findOne({
            where: { txId }
        });
        return transaction;
    }

    static async getContracts() {
        const { Contract } = MODELS;
        const contracts = await Contract.findAll();
        return contracts;
    }
}
