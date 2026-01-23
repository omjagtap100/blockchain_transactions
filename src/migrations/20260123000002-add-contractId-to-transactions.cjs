'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('transactions', 'contractId', {
            type: Sequelize.INTEGER,
            references: {
                model: 'contracts',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('transactions', 'contractId');
    }
};
