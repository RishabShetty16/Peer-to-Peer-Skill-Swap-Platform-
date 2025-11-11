USE skill_swap;

-- 1. Temporarily disable "safe update" mode
SET SQL_SAFE_UPDATES = 0;

-- 2. Delete all data from tables in child-to-parent order
-- (This ensures you don't violate foreign key constraints)
DELETE FROM Feedback_Rating;
DELETE FROM Meetings;
DELETE FROM Chat;
DELETE FROM Matchmaking_Transaction;
DELETE FROM Skill_Needed;
DELETE FROM Skill_Offered;
DELETE FROM Student;

-- 3. Re-enable "safe update" mode
SET SQL_SAFE_UPDATES = 1;

-- 4. Reset the auto-increment counter for the Student table
-- This makes your next student start at ID 1
ALTER TABLE Student AUTO_INCREMENT = 1;