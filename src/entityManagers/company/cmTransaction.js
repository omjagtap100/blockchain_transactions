import { MODELS } from '../../sequelize.js';
import { ApiError } from '../../helper/ApiError.js';
import { HashingService } from '../../helper/HashingService.js';
import axios from 'axios';

const CONTRACT_NAME_MAPPING = {
    Identity: 'TriApp',
    Membership: 'TriApp',
    MembershipAdminMerchant: 'TriApp',
    LoyaltyPoint2: 'TriApp',
    Event: 'TriEvent',
    Certificate: 'TriEvent',
    Voucher: 'TriEvent',
    Collectible: 'TriApp'
};

export class CMTransaction {


    static async fetchFromExternalSource(params) {
        try {
            const url = process.env.EXTERNAL_TRANSACTION_API_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;


            let data = {
                contractName: params.contractName,
                limit: params.limit || 100
            };

            if (params.cursor && params.cursor !== 0 && params.cursor !== '0') {
                data.cursor = params.cursor;
            }

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

    static async fetchUserTransactionsScan(params) {
        try {
            const url = process.env.EXTERNAL_USER_TRANSACTIONS_SCAN_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;

            const data = {
                userAddress: params.userAddress,
                limit: params.limit || 50,
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

            if (response.data && response.data.ok && response.data.data) {
                return response.data.data;
            }
            return { transactions: [], nextCursor: null, message: "No data found or error in response" };

        } catch (error) {
            console.error('Error fetching user transactions scan:', error.message);
            throw error;
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

    static async fetchBlockRangeInfo(params) {
        try {
            const url = process.env.EXTERNAL_BLOCK_RANGE_API_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;
            let data = {}
            if (params.blockHeight) {
                data.blockHeight = params.blockHeight
            }
            else {

                data.startHeight = parseInt(params.startHeight) || 1,
                    data.endHeight = parseInt(params.endHeight) || 10


            }

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
            return { message: "No data found or error in response" };
        } catch (error) {
            console.error('Error fetching block range info:', error.message);
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

        const updateAddress = params.contractName || respContractName;
        if (updateAddress && nextCursor) {
            await Contract.update(
                { cursor: nextCursor },
                { where: { address: updateAddress } }
            );
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

    /**
     * Calls the external getContractList API for a single page,
     * then saves any new contracts into the contracts table.
     * @param {number} offset - The starting position for this page.
     * @param {number} limit  - Number of contracts per page.
     * @returns {{ contracts: Array, total: number, savedCount: number }}
     */
    static async fetchContractList({ offset = 0, limit = 20 } = {}) {
        try {
            const url = process.env.EXTERNAL_CONTRACT_LIST_URL;
            const secretKey = process.env.EXTERNAL_SECRET_KEY;
            const appid = process.env.EXTERNAL_APP_ID;
            const sid = process.env.EXTERNAL_SID;

            const data = { offset, limit };

            const hashkey = await HashingService.generateHash(null, data, secretKey);

            const payload = { data, hashkey };

            const headers = {
                'appid': appid,
                'sid': sid,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXTERNAL_BEARER_TOKEN || ''}`
            };

            const response = await axios.post(url, payload, { headers });

            let contractList = [];
            let total = 0;

            if (response.data && response.data.ok && response.data.data) {
                const resData = response.data.data;

                contractList = resData.contracts || resData.list || resData.data || [];
                total = resData.total ?? contractList.length;
            }


            const { Contract } = MODELS;
            let savedCount = 0;

            for (const contract of contractList) {
                const contractAddress = contract.address || contract.contractAddress || contract.ContractAddress;
                const contractName = contract.name || contract.contractName || contract.Name || contractAddress;

                if (!contractAddress) continue;

                const queryAddress = contractAddress.toLowerCase();

                const [, created] = await Contract.findOrCreate({
                    where: { address: queryAddress },
                    defaults: {
                        name: contractName,
                        address: queryAddress,
                        externalId: contract.ID || contract.id || null,
                        pid: contract.PID !== undefined ? contract.PID : (contract.pid !== undefined ? contract.pid : null),
                        orgId: contract.OrgID || contract.orgId || null,
                        orgName: contract.OrgName || contract.orgName || null,
                        runtimeType: contract.RuntimeType || contract.runtimeType || null,
                        runtimeTypeId: contract.RuntimeTypeID || contract.runtimeTypeId || null,
                        version: contract.Version || contract.version || null,
                        statusCodeName: contract.StatusCodeName || contract.statusCodeName || null,
                        statusCode: contract.StatusCode !== undefined ? contract.StatusCode : (contract.statusCode !== undefined ? contract.statusCode : null),
                        externalCreateTime: contract.CreateTime || contract.createTime || null,
                        externalUpdateTime: contract.UpdateTime || contract.updateTime || null,
                        appId: contract.AppID || contract.appId || null,
                        contentId: contract.ContentID || contract.contentId || null,
                        chainId: contract.ChainID || contract.chainId || null,
                        contentFileName: contract.ContentFileName || contract.contentFileName || null,
                        initParam: contract.InitParam || contract.initParam || null,
                        abiContentFileName: contract.AbiContentFileName || contract.abiContentFileName || null
                    }
                });

                if (created) savedCount++;
            }

            console.log(`[fetchContractList] offset=${offset} — fetched ${contractList.length}, saved ${savedCount} new contract(s).`);

            return { contracts: contractList, total, savedCount };
        } catch (error) {
            console.error('Error fetching contract list from external source:', error.message);
            return { contracts: [], total: 0, savedCount: 0 };
        }
    }

    /**
     * Syncs all contracts from the external getContractList API using paginated offsets.
     * The current offset is persisted in the app_configs table (key: 'contract_list_offset')
     * so the sync can safely resume after a restart without re-processing all pages.
     *
     * @returns {{ syncedCount: number, finalOffset: number }}
     */
    static async syncContractListWithOffset() {
        const { AppConfig } = MODELS;

        let configRow = await AppConfig.findOne({ where: { key: 'contract_list_offset' } });
        let currentOffset = configRow ? parseInt(configRow.value, 10) : 0;

        console.log(`[syncContractListWithOffset] Starting sync from offset ${currentOffset}`);

        const limit = 20;
        let totalSynced = 0;
        let hasMore = true;

        while (hasMore) {
            // fetchContractList fetches the page AND saves new contracts to the DB
            const { contracts, savedCount } = await this.fetchContractList({ offset: currentOffset, limit });

            if (!Array.isArray(contracts) || contracts.length === 0) {
                console.log(`[syncContractListWithOffset] No more contracts at offset ${currentOffset}. Sync complete.`);
                hasMore = false;
                break;
            }

            totalSynced += savedCount;
            currentOffset += contracts.length;

            // Persist the updated offset after each successful page
            if (configRow) {
                configRow.value = String(currentOffset);
                await configRow.save();
            } else {
                configRow = await AppConfig.create({
                    key: 'contract_list_offset',
                    value: String(currentOffset)
                });
            }

            console.log(`[syncContractListWithOffset] Page done: ${savedCount} new contracts saved. Offset now: ${currentOffset}`);


            if (contracts.length < limit) {
                hasMore = false;
            }
        }

        console.log(`[syncContractListWithOffset] Done. Total new: ${totalSynced}. Final offset: ${currentOffset}`);
        return { syncedCount: totalSynced, finalOffset: currentOffset };
    }

    static async getTransactions({ page = 1, pageSize = 10, contractName }) {
        const { Transaction, Contract } = MODELS;
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;
        const whereClause = {};

        if (contractName) {
            whereClause.contractName = contractName;
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Contract,
                    as: 'contract',
                    attributes: ['name', 'address'],
                    required: false
                }
            ],
            limit,
            offset,
            order: [['timestamp', 'DESC']]
        });

        const mappedItems = rows.map((row) => {
            const tx = row.toJSON();
            const contractRecord = tx.contract || null;
            const originalContractName = contractRecord?.name || null;
            const mappedContractName = originalContractName
                ? (CONTRACT_NAME_MAPPING[originalContractName] || originalContractName)
                : null;
            const contractAddress = contractRecord?.address || tx.contractName || null;

            return {
                ...tx,
                contractName: mappedContractName || tx.contractName,
                contractAddress,
                contractOriginalName: originalContractName
            };
        });

        return {
            totalItems: count,
            items: mappedItems,
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

    static async searchTransactions({ query, page = 1, pageSize = 10 }) {
        const { Transaction } = MODELS;
        const { Op } = await import('sequelize');

        if (!query || query.trim() === '') {
            throw new ApiError(400, 'Search query is required');
        }

        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const { count, rows } = await Transaction.findAndCountAll({
            where: {
                [Op.or]: [
                    { txId: { [Op.like]: `%${query}%` } },
                    { from: { [Op.like]: `%${query}%` } },
                    { to: { [Op.like]: `%${query}%` } }
                ]
            },
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
}
