const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class BorrowOrderLog extends Model {
        static associate(models) {

        }
    }
    BorrowOrderLog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            order_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            column_name: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            old_status: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            new_status: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            created_at: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'BorrowOrderLog',
            timestamps: false,
            tableName: 'borrow_order_log', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );
    return BorrowOrderLog;
};