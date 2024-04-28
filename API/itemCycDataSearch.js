const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
const axios = require('axios');

router.post("/classroomCycleDataSearch", async (req, res) => {
  const sequelizess = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: "localhost",
      dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
      timezone: '+08:00',
    }
  );
  try {


    const {
      borrow_start,
      borrow_end,
      id,
      role_id,
      start_time_Hourd,
      start_time_Minute,
      end_time_Hourd,
      end_time_Minute,
      which_day,
    } = req.body;
    let startDate = new Date(borrow_start);
    let endDate = new Date(borrow_end);
    let datelest = [];
    let storage;
    let endstorage;
    let examinetime = new Date(borrow_start);
    var currentDate = new Date();
    examinetime.setHours(start_time_Hourd, start_time_Minute);
    console.log(examinetime, currentDate, examinetime < currentDate);
    if (examinetime < currentDate) {
      return res
        .status(500)
        .send({ message: "開始時間必須超過現在時間!!", errcode: -100020 });
    }
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

    if (datelest.length == 0) {
      return res.status(500).send({
        message: `你所選的時間段裡沒有周${which_day}`,
      });
    }
    let CommuteTimelest = [];
    await axios.post('https://ge-rent.tmu.edu.tw/manage/callback_api/get_off_hour',
      datelest
    )
      .then(function (response) {
        console.log(response.data.result, "測試!!!!!!");
        CommuteTimelest = response.data.result
      })
      .catch(function (errors) {
        console.log(errors, "測試~~~~~");
        return res
          .status(500)
          .send({ message: "使用者登入失敗", error: errors.toString() });
      });
    await sequelizess.query(`
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
      console.log(CommuteTimelest[index], "測試");
      profileValues += AddStrings(
        datelest[index].start_date,
        datelest[index].end_date,
        CommuteTimelest[index][0][0],
        CommuteTimelest[index][0][1],
        CommuteTimelest[index][1][0],
        CommuteTimelest[index][1][1],
        datelest.length - 1 == index ? ";" : ","
      );
    }
    await sequelizess.query(`
          INSERT INTO temp_borrow_time
          (borrow_time_start, borrow_time_end, off_hour_check_start1, off_hour_check_end1, off_hour_check_start2, off_hour_check_end2)
          VALUES
             ${profileValues}
      `);

    const query = `
        SELECT items.id, items.name, items.model, items.img_path, items.note, items.category_id, items_category.category_name, SUM((
          SELECT COUNT(*)
          FROM borrow_order_item
          WHERE borrow_order_item.borrow_end > temp_borrow_time.borrow_time_start
              AND borrow_order_item.borrow_start < temp_borrow_time.borrow_time_end
              AND borrow_order_item.item_id = items.id
              AND borrow_order_item.status > 0
      )) AS duplicated, SUM(IF((
          SELECT COUNT(*)
          FROM borrow_order_item
          WHERE borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start1
              AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end1
              AND borrow_order_item.item_id = items.id
              AND borrow_order_item.status > 0
      ) >= items.borrow_times_off_hour OR (
          SELECT COUNT(*)
          FROM borrow_order_item
          WHERE borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start2
              AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end2
              AND borrow_order_item.item_id = items.id
              AND borrow_order_item.status > 0
      ) >= items.borrow_times_off_hour, 1, 0)) AS off_hour_times_over
      FROM items
      JOIN items_category
      ON items.category_id = items_category.id
      JOIN role_permission_relation
      ON role_permission_relation.role_id = ?
          AND role_permission_relation.permission_id = items.borrow_permission_id
      CROSS JOIN temp_borrow_time
      WHERE items.category_id = ?
      AND items.available = 1
      AND items.deleted_at IS NULL
      GROUP BY items.id;
          `;

    const lestId = [role_id, id];
    const findResult = await sequelizess.query(query, {
      replacements: lestId,
    });
    console.log(findResult[0][0]);
    let data = [
      {
        name: findResult[0][0].category_name,
        list: [],
      },
    ];
    findResult[0].forEach((find) => {
      if (find.duplicated == 0 && find.off_hour_times_over == 0) {
        data[0].list.push({
          id: find.id,
          img_path: find.img_path,
          model: find.model,
          name: find.name,
          note: find.note,
          isCan: true,
        });
      } else {
        data[0].list.push({
          id: find.id,
          img_path: find.img_path,
          model: find.model,
          name: find.name,
          note: find.note,
          isCan: false,
        });
      }
    });
    await sequelizess.close();
    res.send({
      data: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "發生錯誤，請通知相關行政人員!", error: errors.toString() });
  }
});
router.post("/classroomDataSearch", async (req, res) => {
  const sequelizess = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: "localhost",
      dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
      timezone: '+08:00',
    }
  );
  try {
    const { borrow_start, borrow_end, id, role_id } = req.body;
    let examinetime = new Date(borrow_start);
    var currentDate = new Date();
    if (examinetime < currentDate) {
      return res
        .status(500)
        .send({ message: "開始時間必須超過現在時間!!", errcode: -100020 });
    }
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
        ON role_permission_relation.role_id = ?
            AND role_permission_relation.permission_id = items.borrow_permission_id
    WHERE items.category_id = ?
        AND items.available = 1
        AND items.deleted_at IS NULL;`;

    const profileValues = [borrow_start, borrow_end, CommuteTime[0][0], CommuteTime[0][1], CommuteTime[1][0], CommuteTime[1][1], role_id, id];
    const findResult = await sequelizess.query(queryItems, {
      replacements: profileValues,
    });
    console.log(findResult[0]);
    let data = [
      {
        name: findResult[0][0].category_name,
        list: [],
      },
    ];
    findResult[0].forEach((find) => {
      if (find.duplicated == 0 && find.off_hour_times_over == 0) {
        data[0].list.push({
          id: find.id,
          img_path: find.img_path,
          model: find.model,
          name: find.name,
          note: find.note,
          isCan: true,
        });
      } else {
        data[0].list.push({
          id: find.id,
          img_path: find.img_path,
          model: find.model,
          name: find.name,
          note: find.note,
          isCan: false,
        });
      }
    });
    await sequelizess.close();
    res.send({
      data: data,
    });
  } catch (e) {
    return res
      .status(500)
      .send({ message: "使用者登入失敗", error: e.toString() });
  }
});

function AddStrings(a, b, c, d, e, f, end) {
  return `("${a}", "${b}", ${c == null ? null : '"' + c + '"'}, ${d == null ? null : '"' + d + '"'
    }, ${e == null ? null : '"' + e + '"'}, ${f == null ? null : '"' + f + '"'
    })${end}`;
}

module.exports = router;
