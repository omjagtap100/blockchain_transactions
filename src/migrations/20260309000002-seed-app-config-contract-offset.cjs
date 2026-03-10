'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('app_configs', [
            {
                key: 'contract_list_offset',
                value: '0',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {

            ignoreDuplicates: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('app_configs', {
            key: 'contract_list_offset'
        });
    }
};
