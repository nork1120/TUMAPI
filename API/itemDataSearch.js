const express = require("express");
const router = express.Router();
var moment = require("moment");
require("moment/locale/zh-tw");
moment.locale("zh-tw");
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

router.post("/itemCycleDataSearch", async (req, res) => {
    const { borrow_start, borrow_end, id, role_id, start_time_Hourd, start_time_Minute, end_time_Hourd, end_time_Minute, which_day } = req.body;
    console.log(borrow_start.toISOString().slice(0,));
    let startDate = new Date('2024-03-01');
    let endDate = new Date('2024-03-29');
    let datelest = [];
    let storage;
    let endstorage;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === which_day) {
            storage = new Date(d);
            endstorage = new Date(d);
            storage.setHours(start_time_Hourd + 8, start_time_Minute)
            endstorage.setHours(end_time_Hourd + 8, end_time_Minute)
            datelest.push({
                start_date: storage.toISOString().replace("T", " ").slice(0, -5),
                end_date: endstorage.toISOString().replace("T", " ").slice(0, -5)
            })
        }
    }
    console.log(datelest);
    await sequelize.query(`
    CREATE TEMPORARY TABLE temp_borrow_time(
        borrow_time_start DATETIME NOT NULL,
        borrow_time_end DATETIME NOT NULL,
        off_hour_check_start1 DATETIME,
        off_hour_check_end1 DATETIME,
        off_hour_check_start2 DATETIME,
        off_hour_check_end2 DATETIME
    );
`);
    let profileValues = "";
    for (let index = 0; index < datelest.length; index++) {
        console.log(datelest.length, index);
        profileValues += AddStrings(datelest[index].start_date, datelest[index].end_date, null, null, null, null, datelest.length - 1 == index ? ";" : ",")
    }
    console.log(profileValues);


    await sequelize.query(`
    INSERT INTO temp_borrow_time
    (borrow_time_start, borrow_time_end, off_hour_check_start1, off_hour_check_end1, off_hour_check_start2, off_hour_check_end2)
    VALUES
       ${profileValues}
`);
    const query = `
        SELECT temp_borrow_time.*, FORMAT((
             SELECT COUNT(*)
              FROM borrow_order_item
                    WHERE borrow_order_item.borrow_end > temp_borrow_time.borrow_time_start
                        AND borrow_order_item.borrow_start < temp_borrow_time.borrow_time_end
                        AND borrow_order_item.item_id = items.id
                        AND borrow_order_item.status > 0
            ), 0) AS duplicated, FORMAT((
             SELECT COUNT(*)
              FROM borrow_order_item
                    WHERE borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start1
                        AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end1
                        AND borrow_order_item.item_id = items.id
                        AND borrow_order_item.status > 0
            ), 0) AS off_hour_times1, FORMAT((
             SELECT COUNT(*)
              FROM borrow_order_item
                    WHERE borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start2
                        AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end2
                        AND borrow_order_item.item_id = items.id
                        AND borrow_order_item.status > 0
            ), 0) AS off_hour_times2, items.borrow_times_off_hour
         FROM temp_borrow_time
            JOIN items
                ON items.id = 13
                    AND items.available = 1;
    `;

    const findResult = await sequelize.query(query);
    let data = findResult[0];
    res.send({
        message: "週期性",
        data: data
    })
})



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



function AddStrings(a, b, c, d, e, f, end) {
    return `("${a}", "${b}", ${c == null ? null : "\"" + c + "\""}, ${d == null ? null : "\"" + d + "\""}, ${e == null ? null : "\"" + e + "\""}, ${f == null ? null : "\"" + f + "\""})${end}`
}

module.exports = router;
