const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require("sequelize");
const sequelizess = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
  }
);
router.post("/announcement", async (req, res) => {
  const { type } = req.body;

  const announcementSQL = `SELECT bulletin.content FROM bulletin WHERE bulletin.id = ?`;
  const announcementValue = [type];
  const announcement = await sequelizess.query(announcementSQL, {
    replacements: announcementValue,
  });
  res.send({
    data: announcement[0][0].content,
  });
});

module.exports = router;
