"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Ban_logs extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The models/index file will call this method automatically.
         */

        static associate(models) {
            // Ban_log.belongsTo(models.Department, {
            //     foreignKey: "id",
            //     as: "Ban_log",
            // });
        }
    }
    Ban_logs.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            user_id: DataTypes.INTEGER,
            operator_id: DataTypes.INTEGER,
            reason: DataTypes.STRING,
            original_ban_until: DataTypes.DATE,
            new_ban_until: DataTypes.DATE,
            created_at: DataTypes.DATE,
        },
        {
            sequelize,
            timestamps: false, // 添加這行
            // tableName: "Ban_log"
            freezeTableName: true
        }
    );
    return Ban_logs;
};