const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {

        }
    }
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            real_name: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
                comment: '姓名',
            },
            department_id: {
                type: DataTypes.TINYINT,
                allowNull: false,
            },
            role_id: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: '身分類別(影響可借用項目)',
            },
            phone: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
                comment: '電話',
            },
            email: {
                type: DataTypes.STRING,
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
            },
            valid_until: {
                type: DataTypes.DATE,
                defaultValue: null,
                comment: '帳號有效期限',
            },
            ban_until: {
                type: DataTypes.DATE,
                defaultValue: null,
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
            modelName: 'User',
            timestamps: false,
            tableName: 'user', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
            comment: '使用者資訊', // 指定表格註解
        }
    );
    return User;
};