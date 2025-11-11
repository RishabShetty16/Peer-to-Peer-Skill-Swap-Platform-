DELIMITER $$
CREATE PROCEDURE sp_top_skills()
BEGIN
    SELECT skill_name, COUNT(*) AS demand
    FROM Skill_Needed
    GROUP BY skill_name
    ORDER BY demand DESC
    LIMIT 5;
END$$
DELIMITER ;
