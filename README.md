# Peer-to-Peer-Skill-Swap-Platform-
# SkillSwap – Peer-to-Peer Skill Exchange Platform (Campus Edition)

## Overview
**SkillSwap** is a **database-driven web application** developed as a **DBMS Mini Project** for PES University.  
The platform enables **PESU students** to **offer skills they know** and **learn new ones** through a structured peer-to-peer system.  
It integrates **matchmaking**, **scheduling**, **feedback**, and **admin analytics**, fostering a campus culture of **collaboration and knowledge sharing**.

---

## 👥 Team Information

| Member | SRN | Role |
|--------|------|------|
| **Shibravi Nagesh** | PES1UG23AM285 | Developer / Database Design |
| **Rishab Shetty** | PES1UG23AM918 | Developer / Frontend & Backend Integration |

---

## Problem Statement
Students possess diverse skills but lack a structured way to **share and learn** from each other.  
There is no centralized campus platform that securely connects students wanting to **teach** with those wanting to **learn**.  
**SkillSwap** bridges this gap through a **secure, automated, and data-driven** skill exchange system.

---

## Objectives
- Build a **dedicated peer-learning platform** for PESU students.  
- Allow users to **offer** and **request** skills seamlessly.  
- Implement an **automatic matchmaking system** between learners and providers.  
- Enable **meeting scheduling**, **feedback collection**, and **ratings**.  
- Provide an **admin dashboard** with platform analytics and user management.  
- Maintain a **secure**, **reliable**, and **scalable** MySQL database backend.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | HTML, CSS, JavaScript, React.js |
| **Backend** | Node.js / Express.js |
| **Database** | MySQL |
| **Tools** | VS Code, Draw.io (ER Diagrams), GitHub |
| **Security** | bcrypt (password hashing), JWT (authentication) |

---

## Database Design

### Entities
- **Student**
- **Skill_Offered**
- **Skill_Needed**
- **Matchmaking_Transaction**
- **Chat**
- **Meetings**
- **Feedback_Rating**
- **Admin**

### Key Database Features
- **Triggers:**
  - `trg_assign_rollnumber`: Auto-generates roll numbers.
  - `trg_update_avg_rating`: Updates average rating dynamically.
  - `trg_prevent_duplicate_skill`: Prevents duplicate skills.
- **Stored Procedures:**
  - `sp_match_skills()`: Automatically pairs students.
  - `sp_top_skills()`: Returns top 5 most requested skills.
- **Stored Functions:**
  - `fn_avg_rating()`: Calculates average rating per student.
  - `fn_skill_popularity()`: Counts popularity of a skill.
- **ON DELETE CASCADE** enabled for data integrity.

---

## Features

### Student Functionalities
- **Register & Login** securely using bcrypt and JWT.
- **Offer Skills** (upload supporting media).
- **Request Skills** after offering at least one skill.
- **Auto-Matchmaking** with other students.
- **Propose Meetings** (offline/online).
- **Accept/Reject/Complete Meetings**.
- **Provide Feedback** and **rate peers**.
- **View Top Skills** (most in-demand).

### Admin Functionalities
- **Admin Login** via dedicated portal.
- **View & Manage Students** (CRUD operations).
- **Analytics Dashboard** – total users, top skills, active matches.
- **Search & Filter** users or skills.
- **Data Cleanup** via cascade rules and scripts.

---

## Sample SQL Scripts

### Create & Setup Database
```sql
CREATE DATABASE skill_swap;
USE skill_swap;

