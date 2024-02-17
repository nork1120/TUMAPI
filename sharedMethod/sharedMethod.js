const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("tmu", "root", "nork1120", {
  host: "localhost",
  dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});
const regular = {
  CheckToken: async function (token) {
    const CheckTokenSQL = `SELECT get_user_id_by_token(?);`;
    const CheckTokenDATA = [token];
    const CheckToken = await sequelize.query(CheckTokenSQL, {
      replacements: CheckTokenDATA,
    });
    return CheckToken[0][0][`get_user_id_by_token('${token}')`];
    // const CheckTokenSQL = `UPDATE personal_access_tokens
    // SET last_used_at = NOW(),
    //     expires_at = ADDDATE(ADDTIME(NOW(), "6:00:00"), 0)
    // WHERE token = ?
    //     AND expires_at >= NOW();`
    // const CheckTokenSqlData = [token]

    // const CheckSQL = `SELECT ROW_COUNT();`;

    // const setT = () => {
    //     return new Promise((resolve, reject) => {
    //         setTimeout(async () => {
    //             try {
    //                 const CheckToken = await sequelize.query(CheckTokenSQL, {
    //                     replacements: CheckTokenSqlData,
    //                 })
    //                 resolve(CheckToken);
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         }, 1000);
    //     })
    // }
    // setT().then(async e => {
    //     const [result] = await sequelize.query(CheckSQL);
    //     console.log('Number of rows updated:', result);
    //     return result[0]['ROW_COUNT()']
    // }).catch(err => {
    //     console.log(err);
    // })
  },
};

module.exports = { regular };
