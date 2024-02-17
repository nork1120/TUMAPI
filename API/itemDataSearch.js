const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize("tmu", "root", "nork1120", {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});
// api範例
// "id": [
//     1
// ],
// "borrow_start": "2024-01-26 08:00:00",
// "borrow_end": "2024-01-26 17:00:00"
router.post("/itemDataSearch", async (req, res) => {

    // const findResult = await sequelize.query("SELECT items.id,items.`name`,items.model,items.img_path,items.note ,items_category.category_name,items.category_id FROM items JOIN items_category ON items.category_id = items_category.id  WHERE  `items`.`available` = 1   AND items.id IN ( " + req.body.id.join(",") + ")   AND NOT EXISTS (  SELECT  	*   FROM  	borrow_order_item   WHERE  	`borrow_order_item`.`borrow_end` > " + "\"" + req.body.borrow_start + "\"" + "   AND `borrow_order_item`.`borrow_start` < " + "\"" + req.body.borrow_end + "\"" + " AND `borrow_order_item`.`item_id` = `items`.`id` AND `borrow_order_item`.`status` > 0   )ORDER BY items.category_id DESC;")
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
	AND items.available = 1;`
    const profileValues = [
        req.body.borrow_start,
        req.body.borrow_end,
        2,
        req.body.id
    ];

    const findResult = await sequelize.query(queryItems, {
        replacements: profileValues,
    })
    // const findResult = await sequelize.query("SELECT   `items`.`id`,   `items`.`name`,   `items`.`model`,   `items`.`img_path`,   `items`.`note`,   `items`.`category_id`,   `items_category`.`category_name`,   FORMAT (       (           SELECT               COUNT(*)           FROM               `borrow_order_item`           WHERE               `borrow_order_item`.`borrow_end` >" + "\"" + req.body.borrow_start + "\"" + " AND `borrow_order_item`.`borrow_start` < " + "\"" + req.body.borrow_end + "\"" + " AND `borrow_order_item`.`item_id` = `items`.`id`               AND `borrow_order_item`.`status` > 0       ),       0   ) AS `duplicated`,   FORMAT (       (           SELECT               COUNT(*)           FROM               `borrow_order_item`           WHERE               `borrow_order_item`.`borrow_end` > NULL AND `borrow_order_item`.`borrow_start` < NULL AND `borrow_order_item`.`item_id` = `items`.`id`               AND `borrow_order_item`.`status` > 0       ),       0   ) AS `off_hour_times`,   `items`.`borrow_times_off_hour` FROM   `items`   JOIN `items_category` ON `items`.`category_id` = `items_category`.`id` WHERE  items.id IN ( " + req.body.id.join(",") + ")    AND `items`.`available` = 1;")
    let data = findResult[0];
    console.log(findResult);
    // 使用 reduce 將資料按 category_name 分組
    const groupedData = data.reduce((acc, item) => {
        const key = item.category_name;


        if (!acc[key]) {
            acc[key] = [];
        }


        acc[key].push(item);

        return acc;
    }, {});
    res.json(groupedData)
    res.end();
});

module.exports = router;