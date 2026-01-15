'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('transactions', {
            txId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING,
                unique: true
            },
            blockHeight: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            blockHash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            from: {
                type: Sequelize.STRING,
                allowNull: false
            },
            to: {
                type: Sequelize.STRING,
                allowNull: false
            },
            contractName: {
                type: Sequelize.STRING,
                allowNull: true
            },
            method: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false
            },
            timestamp: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
            dateTime: {
                type: Sequelize.STRING,
                allowNull: false
            },
            gasUsed: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });


        await queryInterface.addIndex('transactions', ['timestamp']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('transactions');
    }
};
