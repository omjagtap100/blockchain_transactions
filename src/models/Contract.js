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
        },
        externalId: { type: DataTypes.INTEGER, allowNull: true },
        pid: { type: DataTypes.INTEGER, allowNull: true },
        orgId: { type: DataTypes.INTEGER, allowNull: true },
        orgName: { type: DataTypes.STRING, allowNull: true },
        runtimeType: { type: DataTypes.STRING, allowNull: true },
        runtimeTypeId: { type: DataTypes.INTEGER, allowNull: true },
        version: { type: DataTypes.STRING, allowNull: true },
        statusCodeName: { type: DataTypes.STRING, allowNull: true },
        statusCode: { type: DataTypes.INTEGER, allowNull: true },
        externalCreateTime: { type: DataTypes.DATE, allowNull: true },
        externalUpdateTime: { type: DataTypes.DATE, allowNull: true },
        appId: { type: DataTypes.STRING, allowNull: true },
        contentId: { type: DataTypes.INTEGER, allowNull: true },
        chainId: { type: DataTypes.INTEGER, allowNull: true },
        contentFileName: { type: DataTypes.STRING, allowNull: true },
        initParam: { type: DataTypes.TEXT, allowNull: true },
        abiContentFileName: { type: DataTypes.STRING, allowNull: true }
    }, {
        tableName: 'contracts',
        timestamps: true,
    });

    return Contract;
};
