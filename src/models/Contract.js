import { DataTypes } from 'sequelize';

export default function (sequelize) {
    const Contract = sequelize.define('Contract', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        cursor: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: 0
        }
    }, {
        tableName: 'contracts',
        timestamps: true,
    });

    return Contract;
};
