SELECT items.id, items.name, items.model, items.img_path, items.note, items.category_id, items_category.category_name, SUM((
        SELECT COUNT(*)
        FROM borrow_order_item
        WHERE borrow_order_item.borrow_end > temp_borrow_time.borrow_time_start
            AND borrow_order_item.borrow_start < temp_borrow_time.borrow_time_end
            AND borrow_order_item.item_id = items.id
            AND borrow_order_item.status > 0
    )) AS duplicated, SUM(IF((
        SELECT COUNT(*)
        FROM borrow_order_item
        WHERE borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start1
            AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end1
            AND borrow_order_item.item_id = items.id
            AND borrow_order_item.status > 0
    ) >= items.borrow_times_off_hour OR (
        SELECT COUNT(*)
        FROM borrow_order_item
        WHERE borrow_order_item.borrow_end > temp_borrow_time.off_hour_check_start2
            AND borrow_order_item.borrow_start < temp_borrow_time.off_hour_check_end2
            AND borrow_order_item.item_id = items.id
            AND borrow_order_item.status > 0
    ) >= items.borrow_times_off_hour, 1, 0)) AS off_hour_times_over
FROM items
JOIN items_category
    ON items.category_id = items_category.id
JOIN role_permission_relation
    ON role_permission_relation.role_id = ?
        AND role_permission_relation.permission_id = items.borrow_permission_id
CROSS JOIN temp_borrow_time
WHERE items.category_id = ?
    AND items.available = 1
    AND items.deleted_at IS NULL;
GROUP BY items.id;