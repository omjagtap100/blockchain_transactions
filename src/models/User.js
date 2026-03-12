export default (sequelize, DataTypes) => {
    const User = sequelize.define('users', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        firstName: { type: DataTypes.STRING, allowNull: true },
        lastName: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true, unique: true },
        phone: { type: DataTypes.STRING, allowNull: true, unique: true },
        password: { type: DataTypes.STRING, allowNull: true }, // Make nullable if using OTP only later
        accountId: { type: DataTypes.STRING, allowNull: true },
        externalUserId: { type: DataTypes.STRING, allowNull: true },
        username: { type: DataTypes.STRING, allowNull: true },
        membershipId: { type: DataTypes.STRING, allowNull: true },
        walletId: { type: DataTypes.STRING, allowNull: true },
        walletAddress: { type: DataTypes.STRING, allowNull: true },
        externalAccessToken: { type: DataTypes.TEXT, allowNull: true },
        externalRefreshToken: { type: DataTypes.TEXT, allowNull: true },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BANNED'),
            allowNull: false,
            defaultValue: 'ACTIVE'
        },
        createdBy: {
            type: DataTypes.ENUM('system', 'login'),
            allowNull: false,
            defaultValue: 'login'
        },
    }, {
        tableName: 'users',
        timestamps: true,
        paranoid: true,
    });

    User.associate = (models) => {
        User.hasMany(models.Jwt, { foreignKey: 'userId', as: 'jwts' });
    };

    return User;
};
