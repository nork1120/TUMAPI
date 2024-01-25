const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Department extends Model {
        static associate(models) {

        }
    }
    Department.init(
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
            category: {
                type: DataTypes.TINYINT,
                allowNull: false,
                comment: '1:教職員, 2:學生',
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
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                onUpdate: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'Department',
            timestamps: false,
            tableName: 'department', // 指定表格名稱
            engine: 'InnoDB', // 指定儲存引擎
            charset: 'utf8mb4', // 指定字符集
            collate: 'utf8mb4_unicode_ci', // 指定排序規則
        }
    );
    return Department;
};