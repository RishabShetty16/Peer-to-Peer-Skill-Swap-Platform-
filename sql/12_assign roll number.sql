UPDATE Student
SET roll_number = CONCAT('PES', LPAD(student_id, 5, '0'))
WHERE roll_number IS NULL;
