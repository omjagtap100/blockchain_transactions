import Sequelize from 'sequelize';
import dbConfig from "./config/config.js";
import UserModel from './models/User.js';
import JwtModel from './models/Jwt.js';
import TransactionModel from './models/Transaction.js';
import dotenv from 'dotenv';
dotenv.config();
export let sequelize;
export const MODELS = {};

export const startConnection = async () => {
    sequelize = getSequelize();
    await sequelize.authenticate();

    // Initialize models
    MODELS.User = UserModel(sequelize, Sequelize);
    MODELS.Jwt = JwtModel(sequelize, Sequelize);
    MODELS.Transaction = TransactionModel(sequelize, Sequelize);

    // ==============================
    // USER RELATIONS
    // ==============================
    MODELS.User.hasMany(MODELS.Jwt, { foreignKey: 'userId', as: 'jwts' });
    MODELS.Jwt.belongsTo(MODELS.User, { foreignKey: 'userId', as: 'user' });

};

const getSequelize = () => {
    if (!sequelize) {
        const db = dbConfig[process.env.NODE_ENV || 'development'];
        console.log(db);
        sequelize = new Sequelize(db.database, db.username, db.password, {
            host: db.host,
            port: db.port,
            dialect: 'mysql',
            pool: { max: 50, min: 0, acquire: 30000, idle: 10000 },
            timezone: '+08:00',
            logging: false,
        });
        console.log("Connecting DB");
    } else {
        console.log("DB already connected");
    }
    return sequelize;
};
