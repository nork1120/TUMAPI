const express = require("express");
const router = express.Router();


const { User } = require("../models/User");
const { QueryTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize("tmu", "root", "nork1120", {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});

router.get("/test", async (req, res) => {
    // const findResult = await User.findAll({
    //     attributes: [
    //         "username"
    //     ]
    // });
    const findResult = await sequelize.query("SELECT items.id, items.`name`, items_borrow_permission.permission_name FROM items JOIN items_borrow_permission ON items.borrow_permission_id = items_borrow_permission.id WHERE items_borrow_permission.id IN(4,3,1)")
    console.log();
    res.json(findResult);
    res.end();
});
router.get("/tests", async (req, res) => {
    const findResult = await User.findAll({
        attributes: [
            "username",
        ]
    });

    console.log();
    res.json(findResult);
    res.end();
});

module.exports = router;

