import { DataTypes } from 'sequelize';

export default function (sequelize) {
    const AppConfig = sequelize.define('AppConfig', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'app_configs',
        timestamps: true,
    });

    return AppConfig;
};
