DROP TRIGGER IF EXISTS trg_assign_rollnumber;
DELIMITER $$
CREATE TRIGGER trg_assign_rollnumber
BEFORE INSERT ON Student
FOR EACH ROW
BEGIN
  DECLARE next_id INT;
  SELECT IFNULL(MAX(student_id), 0) + 1 INTO next_id FROM Student;
  SET NEW.roll_number = CONCAT('PES', LPAD(next_id, 5, '0'));
END$$
DELIMITER ;
