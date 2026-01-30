import cron from 'node-cron';
import { startConnection, MODELS } from './src/sequelize.js';
import { CMTransaction } from './src/entityManagers/company/cmTransaction.js';

const startServer = async () => {
    try {
        await startConnection();
        console.log('Database connected successfully.');


        await CMTransaction.syncContracts();
        console.log('Initial contract sync completed.');


        cron.schedule('* * * * *', async () => {
            console.log('Running transaction sync cron job...');
            try {

                await CMTransaction.syncContracts();

                const contracts = await CMTransaction.getContracts();
                console.log(`Found ${contracts.length} contracts to sync.`);

                for (const contract of contracts) {
                    try {

                        const maxBlock = await MODELS.Transaction.max('blockHeight', {
                            where: { contractName: contract.address }
                        });

                        const fromBlock = maxBlock ? maxBlock + 1 : 0;
                        const toBlock = 100000000;

                        console.log(`Syncing ${contract.address} from block ${fromBlock}...`);

                        await CMTransaction.syncTransactions({
                            contractName: contract.address,
                            fromBlock: fromBlock,
                            toBlock: toBlock
                        });

                    } catch (err) {
                        console.error(`Error syncing contract ${contract.address}:`, err.message);
                    }
                }
                console.log('Transaction sync cron job completed.');

            } catch (error) {
                console.error('Error in cron job execution:', error.message);
            }
        });

        console.log('Cron job scheduled: running every minute.');

    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
