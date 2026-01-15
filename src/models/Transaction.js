import { DataTypes } from 'sequelize';

export default function (sequelize) {
    const Transaction = sequelize.define('Transaction', {
        txId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        blockHeight: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        blockHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        from: {
            type: DataTypes.STRING,
            allowNull: false
        },
        to: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contractName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        method: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        dateTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gasUsed: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'transactions',
        timestamps: true,

    });

    return Transaction;
};
