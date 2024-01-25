const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ItemsCategory extends Model {
        static associate(models) {

        }
    }
    ItemsCategory.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            category_name: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            class: {
                type: DataTypes.TINYINT,
                allowNull: false,
                comment: '0:物品, 1:教室',
            },
            parent_category: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                comment: '所屬父類別',
            },
            valid: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: '0: 無效類別, 1: 有效類別',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'ItemsCategory',
            timestamps: false,
            tableName: 'items_category', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );
    return ItemsCategory;
};