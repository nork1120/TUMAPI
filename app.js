const express = require("express");
const search = require("./API/search")
const app = express();
// const { Employee, Department } = require("./models");
const Sequelize = require("sequelize");

// 創建一個 Sequelize 實例，並連接到你的數據庫
const sequelize = new Sequelize("tmu", "root", "nork1120", {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});
// 
app.use("/API/search", search);

// 在开始服务器前同步所有模型(Model)
sequelize.sync().then(() => {
    app.listen(8000, () => {
        console.log("伺服器正在聆聽port 8000...");
    });
});