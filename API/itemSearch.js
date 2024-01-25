const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize("tmu", "root", "nork1120", {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});
// api範例
// id:"1"

router.post("/ItemSearch", async (req, res) => {
    const findResult = await sequelize.query("SELECT items.id, items.`name`,items.model,items.img_path,items.note,`catagory`.`category_name` FROM user JOIN role_permission_relation AS relation  ON `relation`.`role_id` = `user`.`role_id` JOIN items  ON `items`.`borrow_permission_id` = `relation`.`permission_id` JOIN items_category AS catagory  ON `catagory`.`id` = `items`.`category_id` AND `catagory`.`vaild` = 1 AND `catagory`.`class` = 0 WHERE `user`.`id` = " + req.body.id + ";")
    res.json(findResult[0]);
    res.end();
});

module.exports = router;

