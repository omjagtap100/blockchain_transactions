export default (sequelize, DataTypes) => {
    const Jwt = sequelize.define('jwts', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'ACTIVE' },
        token: { type: DataTypes.TEXT, allowNull: false },
        expire: { type: DataTypes.DATE, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
        tableName: 'jwts',
        timestamps: true,
        paranoid: true,
    });

    Jwt.associate = (models) => {
        Jwt.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Jwt;
};
