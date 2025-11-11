/*
-- ==========================================================
-- POPULATE SCRIPT (FOR EMPTY DATABASE)
-- ==========================================================
-- Run this AFTER you have deleted all data
*/

USE skill_swap;

-- 1. Set the hashed password for 'pass123'
SET @hashed_pass = '$2b$12$Y/xV.UP.u.L4.l.v/Q.w.t.e.j.w.o.o.O.T.L.P.S.I.Q.U.A.S.S.O';

-- 2. Insert 20 new students (IDs will start from 1)
INSERT INTO Student (name, email, department, password, contact) VALUES
('Ravi Kumar', 'ravi@pes.edu', 'CSE', @hashed_pass, '9876543210'),
('Priya Sharma', 'priya@pes.edu', 'ECE', @hashed_pass, '9876543211'),
('Amit Singh', 'amit@pes.edu', 'ME', @hashed_pass, '9876543212'),
('Sneha Reddy', 'sneha@pes.edu', 'EEE', @hashed_pass, '9876543213'),
('Vikram Rao', 'vikram@pes.edu', 'CSE', @hashed_pass, '9876543214'),
('Anjali Gupta', 'anjali@pes.edu', 'BT', @hashed_pass, '9876543215'),
('Karan Mehta', 'karan@pes.edu', 'ECE', @hashed_pass, '9876543216'),
('Meera Desai', 'meera@pes.edu', 'CSE', @hashed_pass, '9876543217'),
('Arjun Nair', 'arjun@pes.edu', 'ME', @hashed_pass, '9876543218'),
('Diya Varma', 'diya.v@pes.edu', 'EEE', @hashed_pass, '9876543219'),
('Rohan Joshi', 'rohan.j@pes.edu', 'CSE', @hashed_pass, '9876543220'),
('Sana Khan', 'sana@pes.edu', 'BT', @hashed_pass, '9876543221'),
('Jay Patil', 'jay@pes.edu', 'ME', @hashed_pass, '9876543222'),
('Aditi Mishra', 'aditi@pes.edu', 'CSE', @hashed_pass, '9876543223'),
('Leo Das', 'leo@pes.edu', 'ECE', @hashed_pass, '9876543224'),
('Zara Ahmed', 'zara@pes.edu', 'CSE', @hashed_pass, '9876543225'),
('Neil Shah', 'neil@pes.edu', 'ME', @hashed_pass, '9876543226'),
('Ishika Jain', 'ishika@pes.edu', 'EEE', @hashed_pass, '9876543227'),
('Dev Prasad', 'dev@pes.edu', 'CSE', @hashed_pass, '9876543228'),
('Tara Iyer', 'tara@pes.edu', 'BT', @hashed_pass, '9876543229');

-- 3. Add Skills Offered (for students 1-20)
INSERT INTO Skill_Offered (student_id, skill_name, description, media_url) VALUES
(1, 'Python', 'Expert in Django and Flask', 'placeholder.jpg'),
(1, 'Data Analysis', 'Pandas, NumPy, and Matplotlib', NULL),
(2, 'Web Design', 'HTML, CSS, and JavaScript specialist', 'placeholder.mov'),
(2, 'UI/UX Design', 'Figma and Adobe XD', NULL),
(3, 'Java', 'Spring Boot microservices', NULL),
(3, 'C++', 'Data structures and algorithms', NULL),
(4, 'Graphic Design', 'Adobe Illustrator and Photoshop', 'placeholder.jpg'),
(4, 'Video Editing', 'Adobe Premiere Pro', NULL),
(5, 'Machine Learning', 'TensorFlow and PyTorch', 'placeholder.jpg'),
(5, 'Data Analysis', 'Advanced SQL and Tableau', NULL),
(6, 'Content Writing', 'SEO optimized articles and blogs', NULL),
(6, 'Digital Marketing', 'Social media strategy', NULL),
(7, 'AutoCAD', '2D and 3D modeling for mechanical', NULL),
(7, 'Project Management', 'Agile and Scrum methodologies', NULL),
(8, 'Public Speaking', 'Confident and persuasive speaking', 'placeholder.mov'),
(8, 'Content Writing', 'Creative writing and proofreading', NULL),
(9, 'Python', 'Scripting and automation', NULL),
(9, 'C++', 'Embedded systems', NULL),
(10, 'Graphic Design', 'Logo design and branding', 'placeholder.jpg'),
(10, 'Photography', 'Portrait and event photography', NULL),
(11, 'Digital Marketing', 'Google Ads and SEO', NULL),
(11, 'Web Design', 'React and Node.js', NULL),
(12, 'Java', 'Core Java and Android development', NULL),
(12, 'Data Analysis', 'Excel and PowerBI', NULL),
(13, 'Machine Learning', 'Scikit-learn and Keras', NULL),
(13, 'Python', 'General purpose programming', NULL),
(14, 'Video Editing', 'Final Cut Pro', 'placeholder.mov'),
(14, 'Photography', 'Lightroom expert', NULL),
(15, 'Project Management', 'PMP certified', NULL),
(15, 'Public Speaking', 'Debate and moderation', NULL),
(16, 'UI/UX Design', 'User research and wireframing', NULL),
(16, 'Web Design', 'WordPress development', NULL),
(17, 'C++', 'Game development with Unreal', NULL),
(17, 'Java', 'Enterprise applications', NULL),
(18, 'Content Writing', 'Technical documentation', NULL),
(18, 'Data Analysis', 'Statistical analysis with R', NULL),
(19, 'Python', 'Data science projects', NULL),
(19, 'Machine Learning', 'NLP projects', NULL),
(20, 'Graphic Design', 'Branding and identity', NULL),
(20, 'UI/UX Design', 'Mobile app design', 'placeholder.jpg');

-- 4. Add Skills Needed (for students 1-20)
INSERT INTO Skill_Needed (student_id, skill_name) VALUES
(1, 'Web Design'), (2, 'Python'), (3, 'Graphic Design'), (4, 'Java'),
(5, 'Content Writing'), (6, 'Machine Learning'), (7, 'Public Speaking'), (8, 'AutoCAD'),
(1, 'Graphic Design'), (2, 'Data Analysis'), (3, 'Python'), (4, 'Project Management'),
(5, 'Python'), (6, 'Web Design'), (7, 'Java'), (8, 'Digital Marketing'),
(9, 'Web Design'), (9, 'UI/UX Design'), (10, 'Python'), (10, 'Content Writing'),
(11, 'Graphic Design'), (11, 'Machine Learning'), (12, 'Project Management'), (12, 'Public Speaking'),
(13, 'Web Design'), (13, 'Video Editing'), (14, 'Digital Marketing'), (14, 'C++'),
(15, 'Data Analysis'), (15, 'AutoCAD'), (16, 'Content Writing'), (16, 'Python'),
(17, 'Machine Learning'), (17, 'UI/UX Design'), (18, 'Graphic Design'), (18, 'Web Design'),
(19, 'Video Editing'), (19, 'Project Management'), (20, 'Python'), (20, 'Data Analysis');

-- 5. Run the matchmaking stored procedure
CALL sp_match_skills();

-- 6. Add sample meetings
INSERT INTO Meetings (transaction_id, proposed_by_id, meet_datetime, location_details, status)
VALUES
(
    (SELECT mt.transaction_id FROM Matchmaking_Transaction mt JOIN Skill_Offered so ON mt.offer_id = so.offer_id WHERE so.student_id = 1 AND so.skill_name = 'Python' LIMIT 1),
    1, '2025-11-10 14:00:00', 'Library Cafe', 'Proposed'
),
(
    (SELECT mt.transaction_id FROM Matchmaking_Transaction mt JOIN Skill_Offered so ON mt.offer_id = so.offer_id WHERE so.student_id = 3 AND so.skill_name = 'Java' LIMIT 1),
    4, '2025-11-12 10:00:00', 'Google Meet Link', 'Confirmed'
),
(
    (SELECT mt.transaction_id FROM Matchmaking_Transaction mt JOIN Skill_Offered so ON mt.offer_id = so.offer_id WHERE so.student_id = 5 AND so.skill_name = 'Machine Learning' LIMIT 1),
    5, '2025-11-05 18:00:00', 'Discord Server', 'Completed'
);

-- 7. Add sample feedback for the completed meet
INSERT INTO Feedback_Rating (from_student, to_student, rating, comments)
VALUES
(5, 6, 5, 'Great collaborator! Very clear writer.'),
(6, 5, 4, 'Good designer, but was a bit late to the meet.');

-- 8. Add one more match and proposal for demonstration
INSERT INTO Skill_Offered (student_id, skill_name, description, media_url) VALUES (20, 'Swimming', 'Freestyle and Butterfly', NULL);
INSERT INTO Skill_Needed (student_id, skill_name) VALUES (9, 'Swimming');
CALL sp_match_skills();
INSERT INTO Meetings (transaction_id, proposed_by_id, meet_datetime, location_details, status)
VALUES
(
    (SELECT mt.transaction_id FROM Matchmaking_Transaction mt JOIN Skill_Offered so ON mt.offer_id = so.offer_id WHERE so.student_id = 9 AND so.skill_name = 'Python' LIMIT 1),
    9, '2025-11-15 09:00:00', 'PES Pool', 'Proposed'
);