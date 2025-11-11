CALL sp_match_skills();
SELECT * FROM Matchmaking_Transaction;

INSERT INTO Feedback_Rating (from_student, to_student, rating, comments)
VALUES (2, 1, 5, 'Excellent session!');

SELECT fn_avg_rating(1) AS AvgRating;
SELECT fn_skill_popularity('Python Programming') AS DemandCount;

SELECT * FROM Student;
SELECT * FROM Chat;
SELECT * FROM Schedule;
