const express = require("express");
const router = express.Router();
const registerValidation = require("../Validation").registerValidation;
const loginValidation = require("../Validation").loginValidation;
const { regular } = require("../sharedMethod/sharedMethod");
var moment = require('moment');
const { v4: uuidv4 } = require('uuid');

require('moment/locale/zh-tw');
moment.locale('zh-tw');
const { QueryTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize("tmu", "root", "nork1120", {
  host: "localhost",
  dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});

const bcrypt = require("bcrypt");
const { date } = require("joi");
const saltRounds = 12;

// Middleware
router.use((req, res, next) => {
  console.log("正在經過一個使用者Middleware...");
  next();
});

// 註冊(新增)使用者
router.post("/register", async (req, res) => {
  const { username, password, real_name, department_id, phone, email } =
    req.body;

  try {
    // 驗證使用者註冊資料是否符合規範
    const { error } = registerValidation(req.body);
    if (error) {
      return res.status(200).send(error.details[0].message);
    }

    // 將密碼加鹽
    let hashPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `INSERT INTO user (username, password, real_name, department_id, phone, email) VALUES (?, ?, ?, ?, ?, ?)`;
    const profileValues = [
      username,
      hashPassword,
      real_name,
      department_id,
      phone,
      email,
    ];

    // 新增 用戶 資料
    const [insertResult] = await sequelize.query(insertQuery, {
      replacements: profileValues,
      type: sequelize.QueryTypes.INSERT,
    });

    // 獲取剛剛插入的用戶ID
    const userId = insertResult[0];

    return res.send({ message: "使用者註冊成功!" });
  } catch (e) {
    if (e.toString() == "SequelizeUniqueConstraintError: Validation error") {
      return res
        .status(500)
        .send({ message: "帳號重複", error: e.toString() });
    } else {
      return res
        .status(500)
        .send({ message: "註冊使用者失敗", error: e.toString() });
    }

  }

});

// 使用者登入
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  // 驗證使用者的資料是否符合規範
  try {
    const { error } = loginValidation(req.body);

    if (error) {
      // 驗證失敗
      return res.status(400).send(error.details[0].message);
    }

    // 查看是否有使用者名稱
    // const userExist = await User.findOne({ where: { username: username } });
    const query = `SELECT * FROM user WHERE username = ? LIMIT 1`; // 使用原生 SQL 查詢來查找使用者
    const [users] = await sequelize.query(query, {
      replacements: [username],
      type: sequelize.QueryTypes.SELECT,
    });

    console.log(users);

    if (!users || users.length === 0) {
      // 找不到使用者
      return res.status(500).send({ message: "使用者帳號密碼輸入錯誤，請重新輸入!" });
    }

    let passs;

    let result = await bcrypt.compare(password, users.password).then(e => {
      console.log(e);
      passs = e
    });
    // 確認密碼是否相同
    if (!passs) {
      // 密碼錯誤
      return res.status(500).send({ message: "使用者帳號密碼輸入錯誤，請重新輸入!" });
    }

    let { id, real_name, department_id, role_id, phone, email, vaild_until, ban_until, deleted_at } = users
    let dataD = moment();
    console.log(dataD < vaild_until, dataD, vaild_until);
    if (dataD > vaild_until || null) {
      return res.status(500).send({ message: "帳號需要開通，請找行政人員!" });
    } else if (dataD < ban_until) {
      return res.status(500).send({ message: `你已被停用至${moment(ban_until).calendar()}` });
    } else if (deleted_at != null) {
      return res.status(500).send({ message: "帳號已被刪除!" });
    }

    const uuid = uuidv4();
    console.log(uuid);

    const queryTokens = `INSERT INTO personal_access_tokens
    (user_id, token,expires_at)
    VALUES
    (?, ?,ADDDATE(ADDTIME(NOW(), "6:00:00"), 0));`;
    const profileValues = [
      id,
      uuid
    ];
    const tokens = await sequelize.query(queryTokens, {
      replacements: profileValues,
    });

    // const CheckToken = `UPDATE personal_access_tokens
    // SET last_used_at = NOW(),
    //     expires_at = ADDTIME(NOW(), "6:00:00")
    // WHERE token = ?;
    //     AND expires_at >= NOW();`
    // const CheckTokenData = [
    //   uuid
    // ]
    regular.CheckToken(uuid).then(e => {
      console.log(e, "ssssssssssssss");
    }).catch(err => {
      console.log(err);
      return
    })



    return res.send({ message: "登入成功!", UserData: { real_name, department_id, role_id, phone, email, token: uuid } });



  } catch (e) {
    return res
      .status(500)
      .send({ message: "使用者登入失敗", error: e.toString() });
  }
});

module.exports = router;
