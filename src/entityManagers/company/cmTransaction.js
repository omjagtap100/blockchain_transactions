import { MODELS } from '../../sequelize.js';
import { ApiError } from '../../helper/ApiError.js';
import axios from 'axios';

export class CMTransaction {


    static async fetchFromExternalSource() {

        try {
            const url = 'http://localhost:9010/bcexplorer/contract/transactions';
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

    static async syncTransactions() {
        const transactions = await this.fetchFromExternalSource();
        const { Transaction } = MODELS;

        let newCount = 0;
        for (const tx of transactions) {

            const [record, created] = await Transaction.findOrCreate({
                where: { txId: tx.txId },
                defaults: tx
            });
            if (created) newCount++;
        }
        console.log(`Synced: ${newCount} new transactions.`);
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
}
