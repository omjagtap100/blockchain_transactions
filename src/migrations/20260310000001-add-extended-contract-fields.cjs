'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('contracts', 'externalId', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'pid', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'orgId', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'orgName', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('contracts', 'runtimeType', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('contracts', 'runtimeTypeId', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'version', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('contracts', 'statusCodeName', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('contracts', 'statusCode', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'externalCreateTime', { type: Sequelize.DATE, allowNull: true });
        await queryInterface.addColumn('contracts', 'externalUpdateTime', { type: Sequelize.DATE, allowNull: true });
        await queryInterface.addColumn('contracts', 'appId', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('contracts', 'contentId', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'chainId', { type: Sequelize.INTEGER, allowNull: true });
        await queryInterface.addColumn('contracts', 'contentFileName', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('contracts', 'initParam', { type: Sequelize.TEXT, allowNull: true });
        await queryInterface.addColumn('contracts', 'abiContentFileName', { type: Sequelize.STRING, allowNull: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('contracts', 'externalId');
        await queryInterface.removeColumn('contracts', 'pid');
        await queryInterface.removeColumn('contracts', 'orgId');
        await queryInterface.removeColumn('contracts', 'orgName');
        await queryInterface.removeColumn('contracts', 'runtimeType');
        await queryInterface.removeColumn('contracts', 'runtimeTypeId');
        await queryInterface.removeColumn('contracts', 'version');
        await queryInterface.removeColumn('contracts', 'statusCodeName');
        await queryInterface.removeColumn('contracts', 'statusCode');
        await queryInterface.removeColumn('contracts', 'externalCreateTime');
        await queryInterface.removeColumn('contracts', 'externalUpdateTime');
        await queryInterface.removeColumn('contracts', 'appId');
        await queryInterface.removeColumn('contracts', 'contentId');
        await queryInterface.removeColumn('contracts', 'chainId');
        await queryInterface.removeColumn('contracts', 'contentFileName');
        await queryInterface.removeColumn('contracts', 'initParam');
        await queryInterface.removeColumn('contracts', 'abiContentFileName');
    }
};
