const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
const { regular } = require("../sharedMethod/sharedMethod");
var moment = require("moment");

// require("moment/locale/zh-tw");
// moment.locale("zh-tw");
// const sequelize = new Sequelize("tmu", "root", "nork1120", {
//     host: "localhost",
//     dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
// }
// );
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

router.post("/ClassroomSearch", async (req, res) => {
  const { token } = req.body;

  regular
    .CheckToken(token)
    .then(async (e) => {
      if (e != 0) {

        const queryItems = `SELECT DISTINCT
            catagory.id,
            catagory.category_name,
            catagory.icon
        FROM
            \`user\`
            JOIN role_permission_relation AS relation ON relation.role_id = \`user\`.role_id
            JOIN items ON items.borrow_permission_id = relation.permission_id
            JOIN items_category AS catagory ON catagory.id = items.category_id
            AND catagory.vaild = 1
            AND catagory.class = 1
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

// 查看該使用者全部有哪些(教室or器材)借用單
router.post("/ClassroomsOrItems", async (req, res) => {
  const { token, borrow_type } = req.body;
  regular
    .CheckToken(token)
    .then(async (e) => {
      // 確保提供了所有必要的參數
      console.log(e);
      try {
        const searchQuery = `SELECT * FROM borrow_order WHERE user_id = ? AND borrow_type = ?`;
        const borrowValues = [e, borrow_type];

        // 查詢該使用者所租借的全部(教室or器材)
        const [findResults] = await sequelize.query(searchQuery, {
          replacements: borrowValues,
        });

        // 检查结果是否为空
        if (!findResults || findResults.length === 0) {
          return res.status(404).send("該使用者可能無租借任何教室或器材...");
        }
        console.log(findResults);
        // 0 => 物品(器材) 1 => 教室
        findResults.forEach((fin) => {
          fin.borrow_start = moment.utc(fin.borrow_start).format("LLL");
          fin.borrow_end = moment.utc(fin.borrow_end).format("LLL");
        });
        console.log(findResults);
        return res.send({
          message: `該使用者查詢到的${borrow_type === 0 ? "器材" : "教室"}`,
          data: findResults,
        });
      } catch (err) {
        console.log(err);
        return res.status(200).send("查看使用者租借項目發生錯誤...");
      }
    })
    .catch((err) => {
      console.log(err);
      return;
    });
});
// 查看個別(教室or器材)借用單詳情
router.post("/borrow-details", async (req, res) => {
  const { borrow_order_id, token, borrow_type } = req.body;

  regular
    .CheckToken(token)
    .then(async (e) => {
      // 確保提供了所有必要的參數
      if (!borrow_order_id) {
        return res.status(400).send("借用單編號必須的。");
      }
      if (borrow_type === undefined) {
        return res.status(400).send("借用類型是必須的。");
      }

      try {
        const searchQuery = `
                SELECT
                borrow_order_item.*,
                items.* 
            FROM
                borrow_order_item
                JOIN borrow_order ON borrow_order.id = borrow_order_item.borrow_order_id 
                AND borrow_order.borrow_type = ?
                JOIN items ON items.id = borrow_order_item.item_id 
            WHERE
                borrow_order_item.borrow_order_id = ? 
                AND borrow_order.user_id = ?
    `;

        const findResults = await sequelize.query(searchQuery, {
          replacements: [borrow_type, borrow_order_id, e],
          type: sequelize.QueryTypes.SELECT,
        });

        // 檢查搜尋結果是否有找到
        if (findResults.length === 0) {
          return res.status(404).send("未找到借用单詳情。");
        }
        const { borrow_start, borrow_end, memo } = findResults[0];
        return res.send({
          message: `查询到的借用单詳情，借用類型為${
            borrow_type === 0 ? "" : "教室"
          }`,
          data: {
            list: findResults,
            share: {
              borrow_start: moment.utc(borrow_start).format("LLL"),
              borrow_end: moment.utc(borrow_end).format("LLL"),
              memo,
            },
          },
        });
      } catch (e) {
        console.error(error);
        res.status(500).send("在查詢借用單詳情時發生錯誤。");
      }
    })
    .catch((err) => {
      console.log(err);
      return;
    });
});

module.exports = router;
