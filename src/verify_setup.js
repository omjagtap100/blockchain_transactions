import { startConnection, sequelize, MODELS } from './sequelize.js';


(async () => {
    try {
        console.log("Starting verification...");
        // Ensure environment is set for config lookup
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';
        await startConnection();
        console.log('✅ Database connected.');

        console.log('Loaded Models:', Object.keys(MODELS));

        if (MODELS.User && MODELS.Jwt) {
            console.log('✅ User and Jwt models loaded successfully.');
        } else {
            console.error('❌ Models missing.');
        }

        await sequelize.close();
        console.log("Verification complete.");
    } catch (err) {
        console.error('❌ Setup check failed:', err);
    }
})();
