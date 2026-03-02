import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { startConnection } from './sequelize.js';
import { companyApis } from './routes/company/company_api.js';
import { CMTransaction } from './entityManagers/company/cmTransaction.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const init = async () => {
    await startConnection();
    await CMTransaction.syncContracts();

    app.use(cors({ origin: '*' }));
    app.use(morgan('combined'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '300mb' }));


    app.use(companyApis);

    const PORT = process.env.COMPANY_PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

init();
