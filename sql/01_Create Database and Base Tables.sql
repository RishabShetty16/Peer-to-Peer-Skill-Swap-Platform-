-- ============================================
-- DATABASE RESET & CREATION
-- ============================================
DROP DATABASE IF EXISTS skill_swap;
CREATE DATABASE skill_swap;
USE skill_swap;

-- ============================================
-- STUDENT TABLE (with roll number auto assign)
-- ============================================
CREATE TABLE Student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  roll_number VARCHAR(10) UNIQUE,
  name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  department VARCHAR(50),
  password VARCHAR(255),
  contact VARCHAR(15)
);

-- ============================================
-- SKILL OFFERED & NEEDED
-- ============================================
CREATE TABLE Skill_Offered (
  offer_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  skill_name VARCHAR(50),
  description VARCHAR(100),
  media_url VARCHAR(255) NULL, -- ADD THIS LINE
  FOREIGN KEY (student_id) REFERENCES Student(student_id)
);

CREATE TABLE Skill_Needed (
  need_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  skill_name VARCHAR(50),
  FOREIGN KEY (student_id) REFERENCES Student(student_id)
);

-- ============================================
-- MATCHMAKING TRANSACTION
-- ============================================
CREATE TABLE Matchmaking_Transaction (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  offer_id INT,
  need_id INT,
  status VARCHAR(20) DEFAULT 'Matched',
  confirmed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (offer_id) REFERENCES Skill_Offered(offer_id),
  FOREIGN KEY (need_id) REFERENCES Skill_Needed(need_id)
);

-- ============================================
-- CHAT (only for matched users)
-- ============================================
CREATE TABLE Chat (
  chat_id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT,
  sender_id INT,
  receiver_id INT,
  message_text VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES Matchmaking_Transaction(transaction_id),
  FOREIGN KEY (sender_id) REFERENCES Student(student_id),
  FOREIGN KEY (receiver_id) REFERENCES Student(student_id)
);

-- ============================================
-- SCHEDULE (post-match scheduling)
-- ============================================
CREATE TABLE Meetings (
  meet_id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT,
  proposed_by_id INT,
  meet_datetime DATETIME,
  location_details VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Proposed',
  FOREIGN KEY (transaction_id) REFERENCES Matchmaking_Transaction(transaction_id),
  FOREIGN KEY (proposed_by_id) REFERENCES Student(student_id)
);

-- ============================================
-- FEEDBACK & ADMIN TABLES
-- ============================================
CREATE TABLE Feedback_Rating (
  feedback_id INT PRIMARY KEY AUTO_INCREMENT,
  from_student INT,
  to_student INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments VARCHAR(100),
  FOREIGN KEY (from_student) REFERENCES Student(student_id),
  FOREIGN KEY (to_student) REFERENCES Student(student_id)
);

CREATE TABLE Admin (
  admin_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50),
  password VARCHAR(50)
);
