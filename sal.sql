SELECT
	department_type.id,
	department_type.type_name,
	department_type.valid 
FROM
	department_type 
WHERE
	department_type.SHOW = 1