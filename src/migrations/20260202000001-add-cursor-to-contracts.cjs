'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {


        await queryInterface.addColumn('Contracts', 'cursor', {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: 0
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Contracts', 'cursor');
    }
};
