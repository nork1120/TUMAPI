const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Item extends Model {
        static associate(models) {

        }
    }
    Item.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            model: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                defaultValue: null,
                comment: '型號',
            },
            borrow_permission_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                comment: '借用權限',
            },
            manage_permission_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                comment: '審核權限',
            },
            img_path: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                defaultValue: null,
                comment: '圖片路徑',
            },
            available: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: '是否開放借用',
            },
            borrow_times_off_hour: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '非上班期間可被借用次數',
            },
            return_notice_time: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: '歸還提醒時間',
            },
            note: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                defaultValue: null,
                comment: '物品說明、註解',
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
            modelName: 'Item',
            timestamps: false,
            tableName: 'items', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );
    return Item;
};