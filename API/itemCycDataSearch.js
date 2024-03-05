const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");

router.post("/classroomCycleDataSearch", async (req, res) => {
  const sequelizess = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: "localhost",
      dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
    }
  );
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
  if (datelest.length == 0) {
    return res.status(500).send({
      message: `你所選的時間段裡沒有周${which_day}`,
    });
  }
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
    console.log(datelest.length, index);
    profileValues += AddStrings(
      datelest[index].start_date,
      datelest[index].end_date,
      null,
      null,
      null,
      null,
      datelest.length - 1 == index ? ";" : ","
    );
  }
  await sequelizess.query(`
          INSERT INTO temp_borrow_time
          (borrow_time_start, borrow_time_end, off_hour_check_start1, off_hour_check_end1, off_hour_check_start2, off_hour_check_end2)
          VALUES
             ${profileValues}
      `);
  // await sequelize.query(`
  // SET session sql_mode="";
  // `);
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
});
router.post("/classroomDataSearch", async (req, res) => {
  // const findResult = await sequelize.query("SELECT items.id,items.`name`,items.model,items.img_path,items.note ,items_category.category_name,items.category_id FROM items JOIN items_category ON items.category_id = items_category.id  WHERE  `items`.`available` = 1   AND items.id IN ( " + req.body.id.join(",") + ")   AND NOT EXISTS (  SELECT  	*   FROM  	borrow_order_item   WHERE  	`borrow_order_item`.`borrow_end` > " + "\"" + req.body.borrow_start + "\"" + "   AND `borrow_order_item`.`borrow_start` < " + "\"" + req.body.borrow_end + "\"" + " AND `borrow_order_item`.`item_id` = `items`.`id` AND `borrow_order_item`.`status` > 0   )ORDER BY items.category_id DESC;")
  const sequelizess = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: "localhost",
      dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
    }
  );
  try {
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
            WHERE borrow_order_item.borrow_end > null
                AND borrow_order_item.borrow_start < null
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ) >= items.borrow_times_off_hour OR (
        SELECT COUNT(*)
            FROM borrow_order_item
            WHERE borrow_order_item.borrow_end > null
                AND borrow_order_item.borrow_start < null
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
    const { borrow_start, borrow_end, id, role_id } = req.body;
    const profileValues = [borrow_start, borrow_end, role_id, id];
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
  return `("${a}", "${b}", ${c == null ? null : '"' + c + '"'}, ${
    d == null ? null : '"' + d + '"'
  }, ${e == null ? null : '"' + e + '"'}, ${
    f == null ? null : '"' + f + '"'
  })${end}`;
}

module.exports = router;
