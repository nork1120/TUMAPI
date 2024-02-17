const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
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

// "SELECT items.id, items.`name`,items.model,items.img_path,items.note,`catagory`.`category_name` FROM \`\`user\`\` JOIN role_permission_relation AS relation  ON `relation`.`role_id` = `\`\`user\`\``.`role_id` JOIN items  ON `items`.`borrow_permission_id` = `relation`.`permission_id` JOIN items_category AS catagory  ON `catagory`.`id` = `items`.`category_id` AND `catagory`.`vaild` = 1 AND `catagory`.`class` = 0 WHERE `\`\`user\`\``.`id` = " + req.body.id + ";"
router.post("/ItemSearch", async (req, res) => {
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
    catagory.id;`
    const profileValues = [
        req.body.id
    ];
    const findResult = await sequelize.query(queryItems, {
        replacements: profileValues,
    })
    res.json(findResult[0]);
    res.end();
});

module.exports = router;
