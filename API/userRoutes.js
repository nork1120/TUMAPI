const express = require("express");
const router = express.Router();
const registerValidation = require("../Validation").registerValidation;
const loginValidation = require("../Validation").loginValidation;
const { QueryTypes, Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
  }
);
const bcrypt = require("bcrypt");
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
      return res.status(400).send(error.details[0].message);
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
    return res
      .status(500)
      .send({ message: "註冊使用者失敗", error: e.toString() });
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
      return res.status(400).send("使用者帳號輸入錯誤，請重新輸入!");
    }

    let result = bcrypt.compare(password, users.password);
    // 確認密碼是否相同
    if (!result) {
      // 密碼錯誤
      return res.status(400).send("輸入密碼錯誤，請重新輸入!");
    }

    return res.send({ message: "登入成功!", UserData: users });
  } catch (e) {
    return res
      .status(500)
      .send({ message: "使用者登入失敗", error: e.toString() });
  }
});

module.exports = router;
