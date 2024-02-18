require("dotenv").config();
const express = require("express");
const itemSearch = require("./API/itemSearch");
const itemDataSearch = require("./API/itemDataSearch");
const ClassroomSearch = require("./API/ClassroomSearch");
const addNewOrderRoutes = require("./API/addNewOrderRoutes");
const userRoutes = require("./API/userRoutes");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// const { Employee, Department } = require("./models");
const Sequelize = require("sequelize");

// 創建一個 Sequelize 實例，並連接到你的數據庫
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
  }
);
//
app.use("/API/search", itemSearch);
app.use("/API/search", itemDataSearch);
app.use("/API/search", ClassroomSearch);
app.use("/API/addOrder", addNewOrderRoutes);
app.use("/API/users", userRoutes);
// app.use("/API/search", itemDataSearch);
// 在开始服务器前同步所有模型(Model)
sequelize.sync().then(() => {
  app.listen(8000, () => {
    console.log("伺服器正在聆聽port 8000...");
  });
});
