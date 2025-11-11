DELIMITER $$
CREATE PROCEDURE sp_match_skills()
BEGIN
    INSERT INTO Matchmaking_Transaction (offer_id, need_id, status)
    SELECT
        so1.offer_id,
        sn2.need_id,
        'Matched'
    FROM
        Skill_Offered so1
    JOIN Skill_Needed sn1 ON so1.student_id = sn1.student_id
    JOIN Skill_Offered so2 ON sn1.skill_name = so2.skill_name
    JOIN Skill_Needed sn2 ON so2.student_id = sn2.student_id
    WHERE
        so1.skill_name = sn2.skill_name
        AND so1.student_id <> so2.student_id
        AND NOT EXISTS (
            SELECT 1 FROM Matchmaking_Transaction
            WHERE (offer_id = so1.offer_id AND need_id = sn2.need_id)
               OR (offer_id = so2.offer_id AND need_id = sn1.need_id)
        );
END$$
DELIMITER ;