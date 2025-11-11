DELIMITER $$
CREATE FUNCTION fn_skill_popularity(skillName VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt
  FROM Skill_Needed
  WHERE skill_name = skillName;
  RETURN cnt;
END$$
DELIMITER ;
