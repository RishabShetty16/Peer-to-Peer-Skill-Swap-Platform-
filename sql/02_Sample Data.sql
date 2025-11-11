INSERT INTO Student (name, email, department, password, contact) VALUES
('Aarav Mehta', 'aarav@pes.edu', 'CSE', 'pass123', '9876543210'),
('Diya Rao', 'diya@pes.edu', 'ECE', 'diya@123', '9988776655'),
('Rohan Singh', 'rohan@pes.edu', 'ME', 'rohan99', '9998887776'),
('Sneha Patil', 'sneha@pes.edu', 'CSE', 'sneha@321', '9876123456'),
('Kiran Sharma', 'kiran@pes.edu', 'EEE', 'kiran@999', '9123456789');

INSERT INTO Skill_Offered (student_id, skill_name, description) VALUES
(1, 'Python Programming', 'Beginner to Intermediate Python'),
(2, 'Public Speaking', 'Improve confidence and delivery'),
(3, 'AutoCAD', 'Mechanical drawing basics'),
(4, 'Web Design', 'HTML/CSS fundamentals'),
(5, 'C Programming', 'Basics of C language');

INSERT INTO Skill_Needed (student_id, skill_name, level_needed) VALUES
(2, 'Python Programming', 'Intermediate'),
(3, 'Public Speaking', 'Beginner'),
(4, 'AutoCAD', 'Beginner'),
(1, 'Web Design', 'Beginner'),
(5, 'Python Programming', 'Advanced');
