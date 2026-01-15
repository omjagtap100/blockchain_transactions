export default (sequelize, DataTypes) => {
    const User = sequelize.define('users', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        firstName: { type: DataTypes.STRING, allowNull: true },
        lastName: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true, unique: true },
        phone: { type: DataTypes.STRING, allowNull: true, unique: true },
        password: { type: DataTypes.STRING, allowNull: true }, // Make nullable if using OTP only later
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
