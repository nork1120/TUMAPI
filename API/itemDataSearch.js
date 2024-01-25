const express = require("express");
const router = express.Router();
const { QueryTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize("tmu", "root", "nork1120", {
    host: "localhost",
    dialect: "mysql", // 或其他數據庫類型，如 'postgres', 'sqlite', 'mssql'
});
// api範例
// "id": [
//     1
// ],
// "borrow_start": "2024-01-26 08:00:00",
// "borrow_end": "2024-01-26 17:00:00"


router.post("/itemDataSearch", async (req, res) => {
    const findResult = await sequelize.query("SELECT items.id,items.`name`,items.model,items.img_path,items.note ,items_category.category_name,items.category_id FROM items JOIN items_category ON items.category_id = items_category.id  WHERE  `items`.`available` = 1   AND items.id IN ( " + req.body.id.join(",") + ")   AND NOT EXISTS (  SELECT  	*   FROM  	borrow_order_item   WHERE  	`borrow_order_item`.`borrow_end` > " + "\"" + req.body.borrow_start + "\"" + "   AND `borrow_order_item`.`borrow_start` < " + "\"" + req.body.borrow_end + "\"" + " AND `borrow_order_item`.`item_id` = `items`.`id` AND `borrow_order_item`.`status` > 0   );")
    let data = findResult[0];
    let arrs = {};
    data.forEach(arr => {
        if (arrs[`category_id${arr.category_id}`] == undefined) {
            // arrs[`K${arr.category_id}`] = {
            //     category_name: arr.category_name,
            //     data: [{
            //         id: arr.id,
            //         name: arr.name,
            //         model: arr.model,
            //         img_path: arr.img_path,
            //         note: arr.note
            //     }]
            // }
            arrs[`category_id${arr.category_id}`] = {
                category: arr.category_name, data: [{
                    id: arr.id,
                    name: arr.name,
                    model: arr.model,
                    img_path: arr.img_path,
                    note: arr.note
                }]
            };
        } else {
            arrs[`category_id${arr.category_id}`].data.push({
                id: arr.id,
                name: arr.name,
                model: arr.model,
                img_path: arr.img_path,
                note: arr.note
            })
        }
    });


    console.log(arrs);
    res.json(arrs);
    res.end();
});

module.exports = router;