import { MODELS } from '../../sequelize.js';
import { ApiError } from '../../helper/ApiError.js';

export class CMTransaction {


    static async fetchFromExternalSource() {

        // const mockData = [
        //     {
        //         "txId": "1213ff6185fe4d3d90ad1d9051119a9ddf923a238dbd4275b7fff00f6d8aa24e",
        //         "blockHeight": 1028550,
        //         "blockHash": "3aaee902e5c8f3cd47c6f6382b268a9caa7ca74f73f6c695404dc34fc3ecb6a1",
        //         "from": "0x4b3633554317829b1ee40034fc97ea6037ec1a84",
        //         "to": "3f4ac2e2ab05da16af1dfa63ab342337dd2eb2a5",
        //         "contractName": "3f4ac2e2ab05da16af1dfa63ab342337dd2eb2a5",
        //         "method": "40d097c3",
        //         "status": "Success",
        //         "timestamp": 1768372031000,
        //         "dateTime": "2026-01-14 11:57",
        //         "gasUsed": 26213
        //     },

        //     {
        //         "txId": "mock_tx_2_older",
        //         "blockHeight": 1028500,
        //         "blockHash": "mock_hash_2",
        //         "from": "0x4b...mock",
        //         "to": "3f4...mock",
        //         "contractName": null,
        //         "method": "transfer",
        //         "status": "Success",
        //         "timestamp": 1768372000000,
        //         "dateTime": "2026-01-14 11:50",
        //         "gasUsed": 21000
        //     }
        // ];
        // return mockData;
        return [];
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
