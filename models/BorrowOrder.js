const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class BorrowOrder extends Model {
        static associate(models) {

        }
    }
    BorrowOrder.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            borrow_start: {
                type: DataTypes.DATE,
                allowNull: false,
                comment: '借用起始時間',
            },
            borrow_end: {
                type: DataTypes.DATE,
                allowNull: false,
                comment: '借用結束時間',
            },
            borrow_deadline: {
                type: DataTypes.DATE,
                allowNull: false,
                comment: '借用起始期限(超過時間仍未借用的物品視為取消借用)',
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                comment: '1: 送出申請, 2: 審核完畢, 3: 已借出, 4: 已歸還, -1: 審核拒絕, -11: 取消借用',
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
            deleted_at: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
        },
        {
            sequelize,
            modelName: 'BorrowOrder',
            timestamps: false,
            tableName: 'borrow_order', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
            paranoid: true, // 啟用偽刪除 (使用 deleted_at 欄位)
        }
    );
    return BorrowOrder;
};