DELIMITER $$
CREATE FUNCTION fn_avg_rating(studentId INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
  DECLARE avgRate DECIMAL(3,2);
  SELECT AVG(rating) INTO avgRate
  FROM Feedback_Rating
  WHERE to_student = studentId;
  RETURN IFNULL(avgRate, 0);
END$$
DELIMITER ;
