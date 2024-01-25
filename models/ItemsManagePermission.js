const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ItemsManagePermission extends Model {
        static associate(models) {

        }
    }

    ItemsManagePermission.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            permission_name: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            valid: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'ItemsManagePermission',
            timestamps: false,
            tableName: 'items_manage_permission', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );

    return ItemsManagePermission;
}
