'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'accountId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'externalUserId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'membershipId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'walletId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'walletAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'externalAccessToken', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'externalRefreshToken', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'accountId');
    await queryInterface.removeColumn('users', 'externalUserId');
    await queryInterface.removeColumn('users', 'username');
    await queryInterface.removeColumn('users', 'membershipId');
    await queryInterface.removeColumn('users', 'walletId');
    await queryInterface.removeColumn('users', 'walletAddress');
    await queryInterface.removeColumn('users', 'externalAccessToken');
    await queryInterface.removeColumn('users', 'externalRefreshToken');
  }
};
