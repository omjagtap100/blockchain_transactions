import cron from 'node-cron';
import { startConnection, MODELS } from './src/sequelize.js';
import { CMTransaction } from './src/entityManagers/company/cmTransaction.js';

const startServer = async () => {
    try {
        await startConnection();
        console.log('Database connected successfully.');


        await CMTransaction.syncContracts();
        console.log('Initial contract sync completed.');


        cron.schedule('*/10 * * * * *', async () => {
            console.log('Running transaction sync cron job...');
            try {
                await CMTransaction.syncContracts();

                const contracts = await CMTransaction.getContracts();
                console.log(`Found ${contracts.length} contracts to sync.`);

                for (const contract of contracts) {
                    try {
                        const currentCursor = contract.cursor;

                        console.log(`Syncing ${contract.address} with cursor ${currentCursor}...`);

                        const { newCount, nextCursor } = await CMTransaction.syncTransactions({
                            contractName: contract.address,
                            cursor: currentCursor
                        });

                        if (nextCursor && nextCursor !== currentCursor) {
                            contract.cursor = nextCursor;
                            await contract.save();
                            console.log(`Updated cursor for ${contract.address} to ${nextCursor}`);
                        }

                    } catch (err) {
                        console.error(`Error syncing contract ${contract.address}:`, err.message);
                    }
                }
                console.log('Transaction sync cron job completed.');

            } catch (error) {
                console.error('Error in cron job execution:', error.message);
            }
        });

        console.log('Cron job scheduled.');

    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
