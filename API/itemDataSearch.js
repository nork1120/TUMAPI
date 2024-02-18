const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
// const sequelize = new Sequelize("tmu", "root", "nork1120", {
//   host: "localhost",
//   dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
// });
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
// "id": [
//     1
// ],
// "borrow_start": "2024-01-26 08:00:00",
// "borrow_end": "2024-01-26 17:00:00"

router.post("/itemDataSearch", async (req, res) => {
    // const findResult = await sequelize.query("SELECT items.id,items.`name`,items.model,items.img_path,items.note ,items_category.category_name,items.category_id FROM items JOIN items_category ON items.category_id = items_category.id  WHERE  `items`.`available` = 1   AND items.id IN ( " + req.body.id.join(",") + ")   AND NOT EXISTS (  SELECT  	*   FROM  	borrow_order_item   WHERE  	`borrow_order_item`.`borrow_end` > " + "\"" + req.body.borrow_start + "\"" + "   AND `borrow_order_item`.`borrow_start` < " + "\"" + req.body.borrow_end + "\"" + " AND `borrow_order_item`.`item_id` = `items`.`id` AND `borrow_order_item`.`status` > 0   )ORDER BY items.category_id DESC;")

    try {
        const queryItems = `SELECT
        items.id,
        items.name,
        items.model,
        items.img_path,
        items.note,
        items.category_id,
        items_category.category_name,
        FORMAT (
            (
            SELECT
                COUNT(*) 
            FROM
                borrow_order_item 
            WHERE
                borrow_order_item.borrow_end > ? 
                AND borrow_order_item.borrow_start < ? AND borrow_order_item.item_id = items.id AND borrow_order_item.STATUS > 0 
            ),
            0 
        ) AS duplicated,
        FORMAT (
            (
            SELECT
                COUNT(*) 
            FROM
                borrow_order_item 
            WHERE
                borrow_order_item.borrow_end > NULL 
                AND borrow_order_item.borrow_start < NULL AND borrow_order_item.item_id = items.id AND borrow_order_item.STATUS > 0 
            ),
            0 
        ) AS off_hour_times,
        items.borrow_times_off_hour 
    FROM
        items
        JOIN items_category ON items.category_id = items_category.id
        JOIN role_permission_relation ON role_permission_relation.role_id = ? 
        AND role_permission_relation.permission_id = items.borrow_permission_id 
    WHERE
        items.category_id IN (?) 
        AND items.available = 1;`;
        const { borrow_start, borrow_end, id, role_id } = req.body;
        const profileValues = [
            borrow_start,
            borrow_end,
            role_id,
            id,
        ];
        const findResult = await sequelize.query(queryItems, {
            replacements: profileValues,
        });
        // const findResult = await sequelize.query("SELECT   `items`.`id`,   `items`.`name`,   `items`.`model`,   `items`.`img_path`,   `items`.`note`,   `items`.`category_id`,   `items_category`.`category_name`,   FORMAT (       (           SELECT               COUNT(*)           FROM               `borrow_order_item`           WHERE               `borrow_order_item`.`borrow_end` >" + "\"" + req.body.borrow_start + "\"" + " AND `borrow_order_item`.`borrow_start` < " + "\"" + req.body.borrow_end + "\"" + " AND `borrow_order_item`.`item_id` = `items`.`id`               AND `borrow_order_item`.`status` > 0       ),       0   ) AS `duplicated`,   FORMAT (       (           SELECT               COUNT(*)           FROM               `borrow_order_item`           WHERE               `borrow_order_item`.`borrow_end` > NULL AND `borrow_order_item`.`borrow_start` < NULL AND `borrow_order_item`.`item_id` = `items`.`id`               AND `borrow_order_item`.`status` > 0       ),       0   ) AS `off_hour_times`,   `items`.`borrow_times_off_hour` FROM   `items`   JOIN `items_category` ON `items`.`category_id` = `items_category`.`id` WHERE  items.id IN ( " + req.body.id.join(",") + ")    AND `items`.`available` = 1;")
        let data = findResult[0];
        console.log(findResult);
        // 使用 reduce 將資料按 category_name 分組
        const groupedData = data.reduce((acc, item) => {
            const key = item.category_name;

            if (!acc[key]) {
                acc[key] = [];
            }
            if (item.duplicated < item.borrow_times_off_hour) {
                acc[key].push(item);
            }
            // acc[key].push(item);
            return acc;
        }, {});
        res.json(groupedData);
        res.end();
    } catch (e) {
        return res
            .status(500)
            .send({ message: "使用者登入失敗", error: e.toString() });
    }


});

// 查看個別物品借用單詳情
router.post("/item-borrow-details", async (req, res) => {
    const { borrow_order_id, user_id } = req.body;

    // 确保提供了所有必要的参数
    if (!borrow_order_id || !user_id) {
        return res.status(200).send("借用單編號和用戶ID是必須的。");
    }

    try {
        const query = `
      SELECT *
      FROM borrow_order_item
      JOIN borrow_order
          ON borrow_order.id = borrow_order_item.borrow_order_id
              AND borrow_order.borrow_type = 0  
      WHERE borrow_order_item.borrow_order_id = ?
          AND borrow_order.user_id = ?;
    `;

        const findResults = await sequelize.query(query, {
            replacements: [borrow_order_id, user_id],
            type: sequelize.QueryTypes.SELECT,
        });

        // 检查结果是否为空
        if (findResults.length === 0) {
            return res.status(404).send("未找到物品借用單詳情。");
        }

        // 返回查询到的结果
        res.send({
            message: "查詢到的物品借用單詳情:",
            data: findResults,
        });
    } catch (error) {
        console.error(error);
        res.status(200).send("查詢物品借用單詳情時發生錯誤。");
    }
});

module.exports = router;
