import { MODELS } from '../../sequelize.js';
import { ApiError } from '../../helper/ApiError.js';
import axios from 'axios';

export class CMTransaction {


    static async fetchFromExternalSource() {

        try {
            const url = `${process.env.CONNECTOR_URL}/contract/transactions`;
            const params = {
                contractName: '3f4ac2e2ab05da16af1dfa63ab342337dd2eb2a5',
                fromBlock: 1025456,
                toBlock: 925456
            };

            const response = await axios.get(url, { params });

            if (response.data && response.data.transactions) {
                return response.data.transactions;
            }
            return [];
        } catch (error) {
            console.error('Error fetching transactions from external source:', error.message);
            return [];
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

    static async syncTransactions() {
        const transactions = await this.fetchFromExternalSource();
        const { Transaction, Contract } = MODELS;

        // Fetch all contracts to map address -> id
        const allContracts = await Contract.findAll();
        const contractMap = {};
        allContracts.forEach(c => {
            contractMap[c.address] = c.id;
        });

        let newCount = 0;
        for (const tx of transactions) {
            // Find contractId based on contractName (address) in transaction
            const cId = contractMap[tx.contractName];

            const [record, created] = await Transaction.findOrCreate({
                where: { txId: tx.txId },
                defaults: {
                    ...tx,
                    contractId: cId || null
                }
            });
            if (created) newCount++;
        }
        console.log(`Synced: ${newCount} new transactions.`);
        return newCount;
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

    static async getTransactions({ page = 1, pageSize = 10 }) {
        const { Transaction } = MODELS;
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const { count, rows } = await Transaction.findAndCountAll({
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
