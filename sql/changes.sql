USE skill_swap;

-- Safety first
SET SQL_SAFE_UPDATES = 0;

-- Drop existing foreign keys to rebuild them
ALTER TABLE Skill_Offered DROP FOREIGN KEY skill_offered_ibfk_1;
ALTER TABLE Skill_Needed DROP FOREIGN KEY skill_needed_ibfk_1;
ALTER TABLE Matchmaking_Transaction DROP FOREIGN KEY matchmaking_transaction_ibfk_1;
ALTER TABLE Matchmaking_Transaction DROP FOREIGN KEY matchmaking_transaction_ibfk_2;
ALTER TABLE Chat DROP FOREIGN KEY chat_ibfk_1;
ALTER TABLE Chat DROP FOREIGN KEY chat_ibfk_2;
ALTER TABLE Chat DROP FOREIGN KEY chat_ibfk_3;
ALTER TABLE Meetings DROP FOREIGN KEY meetings_ibfk_1;
ALTER TABLE Meetings DROP FOREIGN KEY meetings_ibfk_2;
ALTER TABLE Feedback_Rating DROP FOREIGN KEY feedback_rating_ibfk_1;
ALTER TABLE Feedback_Rating DROP FOREIGN KEY feedback_rating_ibfk_2;

-- Re-create foreign keys with ON DELETE CASCADE
ALTER TABLE Skill_Offered
ADD CONSTRAINT fk_skill_offered_student
FOREIGN KEY (student_id) REFERENCES Student(student_id)
ON DELETE CASCADE;

ALTER TABLE Skill_Needed
ADD CONSTRAINT fk_skill_needed_student
FOREIGN KEY (student_id) REFERENCES Student(student_id)
ON DELETE CASCADE;

ALTER TABLE Matchmaking_Transaction
ADD CONSTRAINT fk_match_offer
FOREIGN KEY (offer_id) REFERENCES Skill_Offered(offer_id)
ON DELETE CASCADE;

ALTER TABLE Matchmaking_Transaction
ADD CONSTRAINT fk_match_need
FOREIGN KEY (need_id) REFERENCES Skill_Needed(need_id)
ON DELETE CASCADE;

ALTER TABLE Chat
ADD CONSTRAINT fk_chat_transaction
FOREIGN KEY (transaction_id) REFERENCES Matchmaking_Transaction(transaction_id)
ON DELETE CASCADE;

ALTER TABLE Chat
ADD CONSTRAINT fk_chat_sender
FOREIGN KEY (sender_id) REFERENCES Student(student_id)
ON DELETE CASCADE;

ALTER TABLE Chat
ADD CONSTRAINT fk_chat_receiver
FOREIGN KEY (receiver_id) REFERENCES Student(student_id)
ON DELETE CASCADE;

ALTER TABLE Meetings
ADD CONSTRAINT fk_meetings_transaction
FOREIGN KEY (transaction_id) REFERENCES Matchmaking_Transaction(transaction_id)
ON DELETE CASCADE;

ALTER TABLE Meetings
ADD CONSTRAINT fk_meetings_proposer
FOREIGN KEY (proposed_by_id) REFERENCES Student(student_id)
ON DELETE CASCADE;

ALTER TABLE Feedback_Rating
ADD CONSTRAINT fk_feedback_from
FOREIGN KEY (from_student) REFERENCES Student(student_id)
ON DELETE CASCADE;

ALTER TABLE Feedback_Rating
ADD CONSTRAINT fk_feedback_to
FOREIGN KEY (to_student) REFERENCES Student(student_id)
ON DELETE CASCADE;

-- Turn safety back on
SET SQL_SAFE_UPDATES = 1;
