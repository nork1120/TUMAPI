const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
const axios = require('axios');

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
    timezone: '+08:00',
    pool: {
      max: 1, // 禁用连接池
    },
  }
);
router.post("/itemDataSearch", async (req, res) => {
  try {
    const { borrow_start, borrow_end, id, role_id } = req.body;
    let examinetime = new Date(borrow_start);
    var currentDate = new Date();
    if (examinetime < currentDate) {
      return res
        .status(500)
        .send({ message: "開始時間必須超過現在時間!!", errcode: -100020 });
    }
    console.log(examinetime, currentDate, examinetime < currentDate);
    let dats = [{
      "start_date": borrow_start,
      "end_date": borrow_end
    }]
    let CommuteTime = [];
    await axios.post('https://ge-rent.tmu.edu.tw/manage/callback_api/get_off_hour',
      dats
    )
      .then(function (response) {
        CommuteTime = response.data.result[0];
      })
      .catch(function (errors) {
        return res
          .status(500)
          .send({ message: "使用者登入失敗", error: errors.toString() });
      });

    const queryItems = `SELECT items.id, items.name, items.model, items.img_path, items.note, items.category_id, items_category.category_name, (
        SELECT COUNT(*)
            FROM borrow_order_item
            WHERE borrow_order_item.borrow_end > ?
                AND borrow_order_item.borrow_start < ?
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ) AS duplicated, IF((
        SELECT COUNT(*)
            FROM borrow_order_item
            WHERE borrow_order_item.borrow_end > ?
                AND borrow_order_item.borrow_start < ?
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ) >= items.borrow_times_off_hour OR (
        SELECT COUNT(*)
            FROM borrow_order_item
            WHERE borrow_order_item.borrow_end > ?
                AND borrow_order_item.borrow_start < ?
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ) >= items.borrow_times_off_hour, 1, 0) AS off_hour_times_over
    FROM items
    JOIN items_category
        ON items.category_id = items_category.id
    JOIN role_permission_relation
        ON role_permission_relation.role_id =  ? 
            AND role_permission_relation.permission_id = items.borrow_permission_id
    WHERE   items.category_id IN (?) 
        AND items.available = 1
        AND items.deleted_at IS NULL;`;
    const profileValues = [borrow_start, borrow_end, CommuteTime[0][0], CommuteTime[0][1], CommuteTime[1][0], CommuteTime[1][1], role_id, id];
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
      if (
        item.off_hour_times_over == 0 &&
        item.duplicated == 0
      ) {
        acc[key].push(item);
      }
      // acc[key].push(item);
      return acc;
    }, {});
    res.json(groupedData);
    res.end();
  } catch (e) {
    console.log(e);
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
