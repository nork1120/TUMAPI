const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class BanLog extends Model {
        static associate(models) {

        }
    }
    BanLog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            operator_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reason: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                defaultValue: null,
            },
            original_ban_until: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            new_ban_until: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'BanLog',
            timestamps: false,
            tableName: 'ban_log', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );
    return BanLog;
};