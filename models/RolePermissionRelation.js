const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class RolePermissionRelation extends Model {
        static associate(models) {

        }
    }
    RolePermissionRelation.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            permission_id: {
                type: DataTypes.INTEGER,
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
            modelName: 'RolePermissionRelation',
            timestamps: false,
            tableName: 'role_permission_relation', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );

    return RolePermissionRelation;
};