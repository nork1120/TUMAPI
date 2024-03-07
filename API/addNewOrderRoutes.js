const express = require("express");
const router = express.Router();
const db = require("../models");
const { QueryTypes, Sequelize } = require("sequelize");
const { regular } = require("../sharedMethod/sharedMethod");
const { google } = require("googleapis");
const key = require("../my-project-19357-1686887162807-b9f7da50916b.json");

const jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, [
  "https://www.googleapis.com/auth/calendar",
]);

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
  }
);
router.use((req, res, next) => {
  console.log("正在經過新增訂單Middleware...");
  next();
});
// 處利時間加數(加分鐘) 第一個參數: 需要改變的日期時間,第二個參數: 需要加上的時間(毫秒)
const TimeConversion = (date, addTime) => {
  date = new Date(date); // 將字串轉換為時間物件
  let newUtcDate = new Date(date).getTime() + addTime; // 加上想要的時數
  newUtcDate = new Date(newUtcDate);

  let transferDate =
    newUtcDate.getFullYear() +
    "-" +
    ("0" + (newUtcDate.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + newUtcDate.getDate()).slice(-2) +
    " " +
    ("0" + newUtcDate.getHours()).slice(-2) +
    ":" +
    ("0" + newUtcDate.getMinutes()).slice(-2) +
    ":" +
    ("0" + newUtcDate.getSeconds()).slice(-2);

  return transferDate;
};

// 新增訂單(需要同時新增好幾筆訂單在租借名單(borrow_order資料表)，接著對應使用者ID新增在租借品項(borrow_order_item資料表))
router.post("/addNewOrder", async (req, res) => {
  // 新增訂單到租借名單(borrow_order資料表)
  const {
    token,
    item_id,
    borrow_start,
    borrow_end,
    memo,
    borrow_type,
    name,
    role_id,
  } = req.body;
  try {
    const status = 1;
    const warning = 0;
    regular
      .CheckToken(token)
      .then(async (e) => {
        if (e != 0) {
          console.log(item_id);
          const examineValues = [borrow_start, borrow_end, role_id, item_id];
          await sequelize.query(`
          START TRANSACTION;
      `);
          const examineSQL = `SELECT
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
      items.id IN (?) 
          AND items.available = 1
          AND items.deleted_at IS NULL
          FOR UPDATE;
          `;
          const examine = await sequelize.query(examineSQL, {
            replacements: examineValues,
          });
          let Comparison = [];
          examine[0].forEach((exa) => {
            console.log(exa);
            if (
              exa.off_hour_times < exa.borrow_times_off_hour &&
              exa.duplicated == 0
            ) {
              Comparison.push(exa.id);
            }
          });
          Comparison.sort((a, b) => {
            return a - b;
          });
          item_id.sort((a, b) => {
            return a - b;
          });
          console.log(arraysAreEqual(Comparison, item_id), Comparison, item_id);
          if (arraysAreEqual(Comparison, item_id)) {
            // 計算 borrow_deadline (借用起始期限)
            let borrow_deadline = TimeConversion(borrow_start, 1800000);

            const queryOrder = `INSERT INTO borrow_order (user_id, borrow_start, borrow_end, borrow_deadline, status, warning, memo,borrow_type) VALUES (?, ?, ?, ?, ?, ?, ?,?)`;
            const orderValues = [
              e,
              borrow_start,
              borrow_end,
              borrow_deadline,
              status,
              warning,
              memo,
              borrow_type,
            ];

            // 新增 borrow_order資料表 紀錄
            const [orderResult] = await sequelize.query(queryOrder, {
              replacements: orderValues,
            });
            const OrderId = orderResult; // 根據返回的結果獲取 orderId

            // 計算 return_deadline (歸還期限)
            let return_deadline = TimeConversion(borrow_end, 900000);

            for (const id of item_id) {
              const queryItems = `INSERT INTO borrow_order_item (borrow_order_id, item_id, user_id, borrow_start, borrow_end, status, memo, return_deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
              const ItemValues = [
                OrderId,
                id,
                e,
                borrow_start,
                borrow_end,
                status,
                memo,
                return_deadline,
              ];
              // 插入 borrow_order_item資料表 紀錄
              await sequelize.query(queryItems, {
                replacements: ItemValues,
              });
            }
            if (borrow_type == 1) {
              jwtClient.authorize((err, tokens) => {
                if (err) {
                  console.error("授權失敗:", err);
                  return;
                }
                let inseData = {
                  summary: name,
                  start: {
                    dateTime: borrow_start.replaceAll(" ", "T"),
                    timeZone: "Asia/Taipei",
                  },
                  end: {
                    dateTime: borrow_end.replaceAll(" ", "T"),
                    timeZone: "Asia/Taipei",
                  },
                };
                const calendar = google.calendar({
                  version: "v3",
                  auth: jwtClient,
                });
                calendar.events.insert(
                  {
                    calendarId:
                      "32ef4d4f32507193e6d65baa40ad01a7c4326218511febc40a30b2d95e918974@group.calendar.google.com",
                    resource: inseData,
                  },
                  (err, res) => {
                    if (err) return console.log("API 錯誤: " + err);
                    console.log(res);
                  }
                );
              });
            }
            await sequelize.query(`
            COMMIT;
        `);
            return res.send({ message: "新增訂單成功", OrderId: orderResult });
          } else {
            return res.status(500).send({ message: "物品已被租借走!!" });
          }
        } else {
          return res.send({ message: "token失效" });
        }
      })
      .catch(async (err) => {
        console.log(err);
        await sequelize.query(`
        ROLLBACK;
    `);
        return res
          .status(500)
          .send({ message: "未知錯誤請通知相關行政人員!!" });
      });
  } catch (e) {
    console.log("新增訂單失敗", e);
    return res.status(500).send("新增訂單失敗");
  }
});

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((element, index) => element === arr2[index]);
}

module.exports = router;
