const express = require("express");
const app = express();
const { Ban_logs } = require("./models");
const Sequelize = require("sequelize");

// 創建一個 Sequelize 實例，並連接到你的數據庫
const sequelize = new Sequelize("tmu", "root", "nork1120", {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});

app.get("/test", async (req, res) => {
    const findResult = await Ban_logs.findAll();

    res.json(findResult);
    res.end();
});

// 確保 sequelize 可以正常連接和同步到數據庫
sequelize
    .authenticate()
    .then(() => {
        console.log("Connection has been established successfully.");
        sequelize.sync();
    })
    .catch((err) => {
        console.error("Unable to connect to the database:", err);
    });

// 在开始服务器前同步所有模型(Model)
sequelize.sync().then(() => {
    app.listen(8000, () => {
        console.log("伺服器正在聆聽port 8000...");
    });
});