SELECT items.id, items.name, items.model, items.img_path, items.note, items.category_id, items_category.category_name, (
    SELECT COUNT(*)
        FROM borrow_order_item
        WHERE borrow_order_item.borrow_end > 「$借用時間(開始)」
            AND borrow_order_item.borrow_start < 「$借用時間(結束)」
            AND borrow_order_item.item_id = items.id
            AND borrow_order_item.status > 0
    ) AS duplicated, IF((
    SELECT COUNT(*)
        FROM borrow_order_item
        WHERE borrow_order_item.borrow_end > 「$第一段下班時間(開始)」
            AND borrow_order_item.borrow_start < 「$第一段下班時間(結束)」
            AND borrow_order_item.item_id = items.id
            AND borrow_order_item.status > 0
    ) >= items.borrow_times_off_hour OR (
    SELECT COUNT(*)
        FROM borrow_order_item
        WHERE borrow_order_item.borrow_end > 「$第二段下班時間(開始)」
            AND borrow_order_item.borrow_start < 「$第二段下班時間(結束)」
            AND borrow_order_item.item_id = items.id
            AND borrow_order_item.status > 0
    ) >= items.borrow_times_off_hour, 1, 0) AS off_hour_times_over
FROM items
JOIN items_category
    ON items.category_id = items_category.id
JOIN role_permission_relation
    ON role_permission_relation.role_id = 「$用戶role_id」
        AND role_permission_relation.permission_id = items.borrow_permission_id
WHERE items.category_id = 「$物品/教室類別ID」
    AND items.available = 1
    AND items.deleted_at IS NULL;