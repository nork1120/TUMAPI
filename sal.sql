SELECT
    `items`.`id`,
    `items`.`name`,
    `items`.`model`,
    `items`.`img_path`,
    `items`.`note`,
    `items`.`category_id`,
    `items_category`.`category_name`,
    FORMAT (
        (
            SELECT
                COUNT(*)
            FROM
                `borrow_order_item`
            WHERE
                `borrow_order_item`.`borrow_end` >" + "\"" + "2024-02-15 19:00:00" " + "\"" +
                AND `borrow_order_item`.`borrow_start` < " + "\"" + "2024-02-15 20:00:00" " + "\"" +
                AND `borrow_order_item`.`item_id` = `items`.`id`
                AND `borrow_order_item`.`status` > 0
        ),
        0
    ) AS `duplicated`,
    FORMAT (
        (
            SELECT
                COUNT(*)
            FROM
                `borrow_order_item`
            WHERE
                `borrow_order_item`.`borrow_end` > " + "\"" + "2024-02-15 17:00:00" " + "\"" +
                AND `borrow_order_item`.`borrow_start` < " + "\"" + "2024-02-16 08:00:00" " + "\"" +
                AND `borrow_order_item`.`item_id` = `items`.`id`
                AND `borrow_order_item`.`status` > 0
        ),
        0
    ) AS `off_hour_times`,
    `items`.`borrow_times_off_hour`
FROM
    `items`
    JOIN `items_category` ON `items`.`category_id` = `items_category`.`id`
WHERE
    `items`.`id` = 13
    AND `items`.`available` = 1;