DELIMITER $$
CREATE TRIGGER trg_prevent_duplicate_skill
BEFORE INSERT ON Skill_Offered
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1 FROM Skill_Offered
    WHERE student_id = NEW.student_id
    AND skill_name = NEW.skill_name
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Duplicate skill entry not allowed for the same student';
  END IF;
END$$
DELIMITER ;
