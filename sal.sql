CREATE TEMPORARY TABLE temp_borrow_time (
    borrow_time_start DATETIME NOT NULL,
    borrow_time_end DATETIME NOT NULL,
    off_hour_check_start1 DATETIME,
    off_hour_check_end1 DATETIME,
    off_hour_check_start2 DATETIME,
    off_hour_check_end2 DATETIME
);

INSERT INTO
    temp_borrow_time (
        borrow_time_start,
        borrow_time_end,
        off_hour_check_start1,
        off_hour_check_end1,
        off_hour_check_start2,
        off_hour_check_end2
    )
VALUES
    (
        "2024-01-21 19:00:00",
        "2024-01-21 21:00:00",
        "2024-01-19 18:00:00",
        "2024-01-22 09:00:00",
        "2024-01-19 18:00:00",
        "2024-01-22 09:00:00"
    ),
    (
        "2024-01-28 19:00:00",
        "2024-01-28 21:00:00",
        "2024-01-26 18:00:00",
        "2024-01-29 09:00:00",
        null,
        null
    ),
    (
        "2024-02-04 19:00:00",
        "2024-02-04 21:00:00",
        null,
        null,
        null,
        null
    ),
    (
        "2024-02-11 19:00:00",
        "2024-02-11 21:00:00",
        null,
        null,
        null,
        null
    ),
    (
        "2024-02-18 19:00:00",
        "2024-02-18 21:00:00",
        null,
        null,
        null,
        null
    ),
    (
        "2024-02-25 19:00:00",
        "2024-02-25 21:00:00",
        null,
        null,
        null,
        null
    );

SELECT
    temp_borrow_time.*,
    FORMAT (
        (
            SELECT
                COUNT(*)
            FROM
                borrow_order_item
            WHERE
                borrow_order_item.borrow_end > temp_borrow_time.borrow_time_start
                AND borrow_order_item.borrow_start < temp_borrow_time.borrow_time_end
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ),
        0
    ) AS duplicated,
    FORMAT (
        (
            SELECT
                COUNT(*)
            FROM
                borrow_order_item
            WHERE
                borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start1
                AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end1
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ),
        0
    ) AS off_hour_times1,
    FORMAT (
        (
            SELECT
                COUNT(*)
            FROM
                borrow_order_item
            WHERE
                borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start2
                AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end2
                AND borrow_order_item.item_id = items.id
                AND borrow_order_item.status > 0
        ),
        0
    ) AS off_hour_times2,
    items.borrow_times_off_hour
FROM
    temp_borrow_time
    JOIN items ON items.id = 13
    AND items.available = 1;