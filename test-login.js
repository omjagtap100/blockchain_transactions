import { startConnection, MODELS } from './src/sequelize.js';

async function verifyDB() {
    await startConnection();
    const { User } = MODELS;
    const user = await User.findOne({ where: { phone: '333' } });
    console.log("DB User Record:", JSON.stringify(user, null, 2));
    process.exit(0);
}

verifyDB();
