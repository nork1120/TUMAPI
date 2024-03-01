const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
const { regular } = require("../sharedMethod/sharedMethod");


const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
  }
);
// api範例
// id:"1"
router.post("/ItemSearch", async (req, res) => {
  const { token } = req.body;
  
  regular
    .CheckToken(token)
    .then(async (e) => {
      if (e != 0) {
        const queryItems = `SELECT DISTINCT
        catagory.id,
        catagory.category_name
    FROM
        \`user\`
        JOIN role_permission_relation AS relation ON relation.role_id = \`user\`.role_id
        JOIN items ON items.borrow_permission_id = relation.permission_id
        JOIN items_category AS catagory ON catagory.id = items.category_id
        AND catagory.vaild = 1
        AND catagory.class = 0
    WHERE
        \`user\`.id = ?
    ORDER BY
        catagory.id;`;
        const profileValues = [e];
        const findResult = await sequelize.query(queryItems, {
          replacements: profileValues,
        });
        res.json(findResult[0]);
        res.end();
      } else {
        return res.send({ message: "token失效" });
      }
    })
    .catch((err) => {
      console.log(err);
      return;
    });
});

module.exports = router;
