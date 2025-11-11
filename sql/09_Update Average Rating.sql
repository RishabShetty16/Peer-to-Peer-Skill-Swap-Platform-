DELIMITER $$
CREATE TRIGGER trg_update_avg_rating
AFTER INSERT ON Feedback_Rating
FOR EACH ROW
BEGIN
  DECLARE avg_rate DECIMAL(3,2);
  SELECT AVG(rating)
  INTO avg_rate
  FROM Feedback_Rating
  WHERE to_student = NEW.to_student;

  UPDATE Student
  SET department = CONCAT('Dept: ', department, ' | AvgRating: ', avg_rate)
  WHERE student_id = NEW.to_student;
END$$
DELIMITER ;
