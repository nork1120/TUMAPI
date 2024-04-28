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
        timezone: '+08:00',
    }
);


router.post("/getUnit", async (req, res) => {
    const { type } = req.body;
    const announcementTypeSQL = `SELECT
	department_type.id,
	department_type.type_name,
	department_type.valid 
FROM
	department_type 
WHERE
	department_type.SHOW = 1`
    const [announcementType] = await sequelizess.query(announcementTypeSQL);
    const announcementSQL = `SELECT id,name,type_id FROM department`;
    const [announcement] = await sequelizess.query(announcementSQL);
    let lest = [];
    for (let i = 0; i < announcementType.length; i++) {
        lest.push({ type_name: announcementType[i].type_name, list: [] })
        for (let index = 0; index < announcement.length; index++) {
            if (announcementType[i].id == announcement[index].type_id) {
                lest[i].list.push(announcement[index])
            }
        }
    }
    console.log(lest);
    res.send({
        data: lest,
    });
});

module.exports = router;