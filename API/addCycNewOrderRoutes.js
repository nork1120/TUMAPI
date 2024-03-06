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
router.post("/addCycNewOrderRoutes", async (req, res) => {
  // 新增訂單到租借名單(borrow_order資料表)
  const {
    token,
    item_id,
    borrow_start,
    borrow_end,
    start_time_Hourd,
    start_time_Minute,
    end_time_Hourd,
    end_time_Minute,
    which_day,
    memo,
    borrow_type,
    name,
  } = req.body;
  let startDate = new Date(borrow_start);
  let endDate = new Date(borrow_end);
  let datelest = [];
  let storage;
  let endstorage;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() == which_day) {
      storage = new Date(d);
      endstorage = new Date(d);
      storage.setHours(start_time_Hourd + 8, start_time_Minute);
      endstorage.setHours(end_time_Hourd + 8, end_time_Minute);
      datelest.push({
        start_date: storage.toISOString().replace("T", " ").slice(0, -5),
        end_date: endstorage.toISOString().replace("T", " ").slice(0, -5),
      });
    }
  }
  console.log(datelest);

    try {
      const status = 1;
      const warning = 0;
      regular
        .CheckToken(token)
        .then(async (e) => {
          if (e != 0) {
            // 計算 borrow_deadline (借用起始期限)
            for (const datest of datelest) {
              let borrow_deadline = TimeConversion(datest.start_date, 1800000);
              const queryOrder = `INSERT INTO borrow_order (user_id, borrow_start, borrow_end, borrow_deadline, status, warning, memo,borrow_type) VALUES (?, ?, ?, ?, ?, ?, ?,?)`;
              const orderValues = [
                e,
                datest.start_date,
                datest.end_date,
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
              let return_deadline = TimeConversion(datest.end_date, 900000);

              for (const id of item_id) {
                const queryItems = `INSERT INTO borrow_order_item (borrow_order_id, item_id, user_id, borrow_start, borrow_end, status, memo, return_deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const ItemValues = [
                  OrderId,
                  id,
                  e,
                  datest.start_date,
                  datest.end_date,
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
                      dateTime: datest.start_date.replaceAll(" ", "T"),
                      timeZone: "Asia/Taipei",
                    },
                    end: {
                      dateTime: datest.end_date.replaceAll(" ", "T"),
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
            }
            return res.send({ message: "新增訂單成功"});
          } else {
            return res.send({ message: "token失效" });
          }
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    } catch (e) {
      console.log("新增訂單失敗", e);
      return res.status(500).send("新增訂單失敗");
    }
});

module.exports = router;
