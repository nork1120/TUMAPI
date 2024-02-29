const express = require("express");
const router = express.Router();
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
// api範例
// id:"1"
router.post("/ItemSearch", async (req, res) => {
  const { token } = req.body;
  jwtClient.authorize((err, tokens) => {
    if (err) {
      console.error("授权失败:", err);
      return;
    }
    let inseData = {
      summary: "API 測試",
      start: {
        dateTime: "2024-03-02T09:00:00",
        timeZone: "Asia/Taipei",
      },
      end: {
        dateTime: "2024-03-02T12:00:00",
        timeZone: "Asia/Taipei",
      },
    };
    const calendar = google.calendar({ version: "v3", auth: jwtClient });
    calendar.events.insert(
      {
        calendarId: "32ef4d4f32507193e6d65baa40ad01a7c4326218511febc40a30b2d95e918974@group.calendar.google.com",
        resource: inseData,
      },
      (err, res) => {
        if (err) return console.log("API 返回错误: " + err);
        console.log(res);
      }
    );
  });

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
