const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class BorrowOrderItem extends Model {
        static associate(models) {

        }
    }
    BorrowOrderItem.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            borrow_order_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            item_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            permission_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '審核權限ID',
            },
            borrow_start: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            borrow_end: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                comment: '1: 送出申請, 2: 審核通過, 3: 已借出, 4: 已歸還, -1: 審核不通過, -11: 取消借用',
            },
            return_deadline: {
                type: DataTypes.DATE,
                allowNull: false,
                comment: '歸還期限(期限內未歸還將寄送提醒)',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                onUpdate: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'BorrowOrderItem',
            timestamps: false,
            tableName: 'borrow_order_item', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );
    return BorrowOrderItem;
};