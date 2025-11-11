'''
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pymysql
import pymysql.cursors
import bcrypt
import jwt
import datetime
from werkzeug.utils import secure_filename

# ============================================
# APP CONFIGURATION
# ============================================
app = Flask(__name__)
CORS(app) 

app.config['SECRET_KEY'] = 'f8e2a3b9c7d6e5f4a1b8c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9' # Use your secret key
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov'}

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root', 
    'password': 'root123', # <-- CHANGE THIS
    'db': 'skill_swap',
    'cursorclass': pymysql.cursors.DictCursor
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except pymysql.MySQLError as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

def get_student_id_from_token():
    token = request.headers.get('Authorization')
    if not token: return None, None
    try:
        token = token.split(" ")[1]
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return decoded['student_id'], token
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None, None

# ============================================
# STATIC FILE ROUTE FOR UPLOADS
# ============================================
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ============================================
# AUTHENTICATION ROUTES (Unchanged)
# ============================================
@app.route('/register', methods=['POST'])
def register():
    # ... (same as before)
    data = request.get_json()
    name = data['name']
    email = data['email']
    department = data['department']
    password = data['password'].encode('utf-8')
    contact = data['contact']
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Student (name, email, department, password, contact) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (name, email, department, hashed_password, contact))
        conn.commit()
        return jsonify({'success': True, 'message': 'Registration successful!'}), 201
    except pymysql.IntegrityError:
        return jsonify({'success': False, 'error': 'Email already exists.'}), 409
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    # ... (same as before)
    data = request.get_json()
    email = data['email']
    password = data['password'].encode('utf-8')
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT student_id, password FROM Student WHERE email = %s"
            cursor.execute(sql, (email,))
            student = cursor.fetchone()
            if student and bcrypt.checkpw(password, student['password'].encode('utf-8')):
                token = jwt.encode({
                    'student_id': student['student_id'],
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, app.config['SECRET_KEY'], algorithm="HS256")
                return jsonify({'success': True, 'token': token})
            else:
                return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    finally:
        conn.close()

# ============================================
# API ROUTES (Updated)
# ============================================
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT name, email, roll_number, department FROM Student WHERE student_id = %s", (student_id,))
            student_details = cursor.fetchone()
            cursor.execute("SELECT offer_id, skill_name, description FROM Skill_Offered WHERE student_id = %s", (student_id,))
            offered_skills = cursor.fetchall()
            cursor.execute("SELECT need_id, skill_name FROM Skill_Needed WHERE student_id = %s", (student_id,))
            needed_skills = cursor.fetchall()
            
            # *** UPDATED QUERY 1: Get Confirmed meets + Skill Names ***
            sql_meets = """
                SELECT 
                    m.meet_id, m.meet_datetime, m.location_details, m.status, 
                    s_other.name as partner_name,
                    so.skill_name AS offered_skill,
                    sn.skill_name AS needed_skill
                FROM Meetings m
                JOIN Matchmaking_Transaction mt ON m.transaction_id = mt.transaction_id
                JOIN Skill_Offered so ON mt.offer_id = so.offer_id
                JOIN Skill_Needed sn ON mt.need_id = sn.need_id
                JOIN Student s_other ON (s_other.student_id = sn.student_id)
                WHERE so.student_id = %s AND m.status = 'Confirmed'
                GROUP BY m.meet_id, s_other.name, so.skill_name, sn.skill_name
            """
            cursor.execute(sql_meets, (student_id,))
            upcoming_meets = cursor.fetchall()

            # *** UPDATED QUERY 2: Get Pending proposals TO ME + Skill Names ***
            sql_proposals = """
                SELECT 
                    m.meet_id, m.meet_datetime, m.location_details, m.proposed_by_id,
                    s_proposer.name as proposer_name,
                    so.skill_name AS offered_skill,
                    sn.skill_name AS needed_skill
                FROM Meetings m
                JOIN Student s_proposer ON m.proposed_by_id = s_proposer.student_id
                JOIN Matchmaking_Transaction mt ON m.transaction_id = mt.transaction_id
                JOIN Skill_Offered so ON mt.offer_id = so.offer_id
                JOIN Skill_Needed sn ON mt.need_id = sn.need_id
                WHERE m.status = 'Proposed' 
                  AND m.proposed_by_id != %s
                  AND (so.student_id = %s OR sn.student_id = %s)
                GROUP BY m.meet_id, s_proposer.name, so.skill_name, sn.skill_name
            """
            cursor.execute(sql_proposals, (student_id, student_id, student_id))
            pending_proposals = cursor.fetchall()

            return jsonify({ 
                'student': student_details, 
                'offered_skills': offered_skills, 
                'needed_skills': needed_skills, 
                'upcoming_meets': upcoming_meets,
                'pending_proposals': pending_proposals,
                'current_user_id': student_id  # <-- NEW: Send current user ID
            })
    finally:
        conn.close()

# ... (Keep all other routes: /api/skills/offer, /api/skills/need, etc. ... )
@app.route('/api/skills/offer', methods=['POST'])
def add_offered_skill():
    # ... (same as before)
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    if 'media' not in request.files: return jsonify({'error': 'No file part'}), 400
    file = request.files['media']
    if file.filename == '': return jsonify({'error': 'No selected file'}), 400
    skill_name, description = request.form['skill_name'], request.form['description']
    media_url = None
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{student_id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        media_url = filename
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Skill_Offered (student_id, skill_name, description, media_url) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (student_id, skill_name, description, media_url))
        conn.commit()
        return jsonify({'success': True, 'message': 'Skill offered successfully!'}), 201
    except pymysql.IntegrityError:
        return jsonify({'error': 'Duplicate skill entry not allowed.'}), 409
    finally:
        conn.close()

@app.route('/api/skills/need', methods=['POST'])
def add_needed_skill():
    # ... (same as before)
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM Skill_Offered WHERE student_id = %s", (student_id,))
            if cursor.fetchone()['count'] == 0:
                return jsonify({'error': 'You must offer at least one skill before you can request a skill.'}), 403
            sql = "INSERT INTO Skill_Needed (student_id, skill_name) VALUES (%s, %s)"
            cursor.execute(sql, (student_id, data['skill_name']))
        conn.commit()
        return jsonify({'success': True, 'message': 'Skill needed successfully!'}), 201
    finally:
        conn.close()

@app.route('/api/matches', methods=['GET'])
def get_matches():
    # ... (same as before)
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.callproc('sp_match_skills')
            conn.commit()
            sql = """
                SELECT 
                    mt.transaction_id, mt.status,
                    so.skill_name AS your_offered_skill,
                    so_partner.skill_name AS your_needed_skill,
                    s_partner.name AS partner_name,
                    s_partner.email AS partner_email
                FROM Matchmaking_Transaction mt
                JOIN Skill_Offered so ON mt.offer_id = so.offer_id
                JOIN Skill_Needed sn_partner ON mt.need_id = sn_partner.need_id
                JOIN Student s_user ON so.student_id = s_user.student_id
                JOIN Student s_partner ON sn_partner.student_id = s_partner.student_id
                JOIN Skill_Needed sn_user ON sn_user.student_id = s_user.student_id
                JOIN Skill_Offered so_partner ON so_partner.student_id = s_partner.student_id AND so_partner.skill_name = sn_user.skill_name
                WHERE s_user.student_id = %s AND mt.status != 'Unmatched'
                GROUP BY mt.transaction_id, so.skill_name, so_partner.skill_name, s_partner.name, s_partner.email
            """
            cursor.execute(sql, (student_id,))
            matches = cursor.fetchall()
            return jsonify({'matches': matches})
    finally:
        conn.close()

@app.route('/api/matches/<int:transaction_id>', methods=['GET'])
def get_match_details(transaction_id):
    # ... (same as before)
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql_partner = """
                SELECT s.student_id, s.name, s.email, so_partner.skill_name, so_partner.description, so_partner.media_url
                FROM Matchmaking_Transaction mt
                JOIN Skill_Offered so_user ON mt.offer_id = so_user.offer_id
                JOIN Skill_Needed sn_partner ON mt.need_id = sn_partner.need_id
                JOIN Student s ON sn_partner.student_id = s.student_id
                JOIN Skill_Offered so_partner ON s.student_id = so_partner.student_id
                JOIN Skill_Needed sn_user ON sn_user.student_id = so_user.student_id AND sn_user.skill_name = so_partner.skill_name
                WHERE mt.transaction_id = %s AND so_user.student_id = %s
                GROUP BY s.student_id, s.name, s.email, so_partner.skill_name, so_partner.description, so_partner.media_url
            """
            cursor.execute(sql_partner, (transaction_id, student_id))
            partner_details = cursor.fetchone()
            cursor.execute("SELECT * FROM Meetings WHERE transaction_id = %s ORDER BY meet_datetime DESC", (transaction_id,))
            meetings = cursor.fetchall()
            return jsonify({'partner': partner_details, 'meetings': meetings, 'current_user_id': student_id})
    finally:
        conn.close()

@app.route('/api/meetings/propose', methods=['POST'])
def propose_meet():
    # ... (same as before)
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Meetings (transaction_id, proposed_by_id, meet_datetime, location_details) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (data['transaction_id'], student_id, data['meet_datetime'], data['location_details']))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting proposed!'}), 201
    finally:
        conn.close()

@app.route('/api/meetings/accept/<int:meet_id>', methods=['POST'])
def accept_meet(meet_id):
    # ... (same as before)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Meetings SET status = 'Confirmed' WHERE meet_id = %s", (meet_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting confirmed!'})
    finally:
        conn.close()

@app.route('/api/meetings/deny/<int:meet_id>', methods=['POST'])
def deny_meet(meet_id):
    # ... (same as before)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Meetings SET status = 'Cancelled' WHERE meet_id = %s", (meet_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting cancelled.'})
    finally:
        conn.close()

@app.route('/api/meetings/complete/<int:meet_id>', methods=['POST'])
def complete_meet(meet_id):
    # ... (same as before)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Meetings SET status = 'Completed' WHERE meet_id = %s", (meet_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting marked as complete!'})
    finally:
        conn.close()

@app.route('/api/matches/unmatch', methods=['POST'])
def unmatch():
    # ... (same as before)
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Matchmaking_Transaction SET status = 'Unmatched' WHERE transaction_id = %s", (data['transaction_id'],))
        conn.commit()
        return jsonify({'success': True, 'message': 'You have been unmatched.'})
    finally:
        conn.close()

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    # ... (same as before)
    from_student_id, _ = get_student_id_from_token()
    if not from_student_id: return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json()
    to_student_id, rating, comments = data['to_student_id'], data['rating'], data['comments']
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Feedback_Rating (from_student, to_student, rating, comments) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (from_student_id, to_student_id, rating, comments))
        conn.commit()
        return jsonify({'success': True, 'message': 'Feedback submitted successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/top-skills', methods=['GET'])
def get_top_skills():
    # ... (same as before)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.callproc('sp_top_skills')
            top_skills = cursor.fetchall()
            return jsonify({'success': True, 'top_skills': top_skills})
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)

'''


import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pymysql
import pymysql.cursors
import bcrypt
import jwt
import datetime
from werkzeug.utils import secure_filename
from functools import wraps

# ============================================
# APP CONFIGURATION
# ============================================
app = Flask(__name__)
CORS(app) 

app.config['SECRET_KEY'] = 'f8e2a3b9c7d6e5f4a1b8c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9' # Use your secret key
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov'}

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root', 
    'password': 'root123', # <-- CHANGE THIS
    'db': 'skill_swap',
    'cursorclass': pymysql.cursors.DictCursor
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except pymysql.MySQLError as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# ============================================
# TOKEN & AUTH HELPERS
# ============================================
def get_student_id_from_token():
    token = request.headers.get('Authorization')
    if not token: return None, None
    try:
        token = token.split(" ")[1]
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return decoded['student_id'], token
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None, None

def get_admin_id_from_token():
    token = request.headers.get('Admin-Authorization') # Separate header
    if not token: return None
    try:
        token = token.split(" ")[1]
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        if decoded.get('role') == 'admin':
            return decoded['admin_id']
        return None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        admin_id = get_admin_id_from_token()
        if not admin_id:
            return jsonify({'error': 'Admin access required'}), 401
        return f(*args, **kwargs)
    return decorated

# ============================================
# STATIC FILE ROUTE FOR UPLOADS
# ============================================
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ============================================
# STUDENT AUTH ROUTES
# ============================================
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data['name']
    email = data['email']
    department = data['department']
    password = data['password'].encode('utf-8')
    contact = data['contact']
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Student (name, email, department, password, contact) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (name, email, department, hashed_password, contact))
        conn.commit()
        return jsonify({'success': True, 'message': 'Registration successful!'}), 201
    except pymysql.IntegrityError:
        return jsonify({'success': False, 'error': 'Email already exists.'}), 409
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password'].encode('utf-8')
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT student_id, password FROM Student WHERE email = %s"
            cursor.execute(sql, (email,))
            student = cursor.fetchone()
            if student and bcrypt.checkpw(password, student['password'].encode('utf-8')):
                token = jwt.encode({
                    'student_id': student['student_id'],
                    'role': 'student',
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, app.config['SECRET_KEY'], algorithm="HS256")
                return jsonify({'success': True, 'token': token})
            else:
                return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    finally:
        conn.close()

# ============================================
# STUDENT API ROUTES (Dashboard is FIXED)
# ============================================
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT name, email, roll_number, department FROM Student WHERE student_id = %s", (student_id,))
            student_details = cursor.fetchone()
            cursor.execute("SELECT offer_id, skill_name, description FROM Skill_Offered WHERE student_id = %s", (student_id,))
            offered_skills = cursor.fetchall()
            cursor.execute("SELECT need_id, skill_name FROM Skill_Needed WHERE student_id = %s", (student_id,))
            needed_skills = cursor.fetchall()
            
            # *** FIXED QUERY 1: Get Confirmed meets + Correct Skill Names ***
            sql_meets = """
                SELECT 
                    m.meet_id, m.meet_datetime, m.location_details, m.status, 
                    s_other.name as partner_name,
                    so.skill_name AS user_offered_skill,
                    (
                        SELECT so_partner.skill_name 
                        FROM Skill_Offered so_partner
                        JOIN Skill_Needed sn_user ON so_partner.skill_name = sn_user.skill_name
                        WHERE so_partner.student_id = s_other.student_id AND sn_user.student_id = so.student_id
                        LIMIT 1
                    ) AS user_needed_skill
                FROM Meetings m
                JOIN Matchmaking_Transaction mt ON m.transaction_id = mt.transaction_id
                JOIN Skill_Offered so ON mt.offer_id = so.offer_id
                JOIN Skill_Needed sn ON mt.need_id = sn.need_id
                JOIN Student s_other ON (s_other.student_id = sn.student_id)
                WHERE so.student_id = %s AND m.status = 'Confirmed'
                GROUP BY m.meet_id, s_other.name, so.skill_name
            """
            cursor.execute(sql_meets, (student_id,))
            upcoming_meets = cursor.fetchall()

            # *** FIXED QUERY 2: Get Pending proposals TO ME + Correct Skill Names ***
            sql_proposals = """
                SELECT 
                    m.meet_id, m.meet_datetime, m.location_details, m.proposed_by_id,
                    s_proposer.name as proposer_name,
                    so.skill_name AS user_offered_skill,
                    (
                        SELECT so_partner.skill_name 
                        FROM Skill_Offered so_partner
                        JOIN Skill_Needed sn_user ON so_partner.skill_name = sn_user.skill_name
                        WHERE so_partner.student_id = s_proposer.student_id AND sn_user.student_id = %s
                        LIMIT 1
                    ) AS user_needed_skill
                FROM Meetings m
                JOIN Student s_proposer ON m.proposed_by_id = s_proposer.student_id
                JOIN Matchmaking_Transaction mt ON m.transaction_id = mt.transaction_id
                JOIN Skill_Offered so ON mt.offer_id = so.offer_id
                JOIN Skill_Needed sn ON mt.need_id = sn.need_id
                WHERE m.status = 'Proposed' 
                  AND m.proposed_by_id != %s
                  AND (so.student_id = %s OR sn.student_id = %s)
                GROUP BY m.meet_id, s_proposer.name, so.skill_name
            """
            cursor.execute(sql_proposals, (student_id, student_id, student_id, student_id))
            pending_proposals = cursor.fetchall()

            return jsonify({ 
                'student': student_details, 
                'offered_skills': offered_skills, 
                'needed_skills': needed_skills, 
                'upcoming_meets': upcoming_meets,
                'pending_proposals': pending_proposals,
                'current_user_id': student_id
            })
    finally:
        conn.close()

# ... (All other student API routes: /api/skills/offer, /api/skills/need, /api/matches, etc. remain exactly the same as the last version) ...
@app.route('/api/skills/offer', methods=['POST'])
def add_offered_skill():
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    if 'media' not in request.files: return jsonify({'error': 'No file part'}), 400
    file = request.files['media']
    if file.filename == '': return jsonify({'error': 'No selected file'}), 400
    skill_name, description = request.form['skill_name'], request.form['description']
    media_url = None
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{student_id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        media_url = filename
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Skill_Offered (student_id, skill_name, description, media_url) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (student_id, skill_name, description, media_url))
        conn.commit()
        return jsonify({'success': True, 'message': 'Skill offered successfully!'}), 201
    except pymysql.IntegrityError:
        return jsonify({'error': 'Duplicate skill entry not allowed.'}), 409
    finally:
        conn.close()

@app.route('/api/skills/need', methods=['POST'])
def add_needed_skill():
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM Skill_Offered WHERE student_id = %s", (student_id,))
            if cursor.fetchone()['count'] == 0:
                return jsonify({'error': 'You must offer at least one skill before you can request a skill.'}), 403
            sql = "INSERT INTO Skill_Needed (student_id, skill_name) VALUES (%s, %s)"
            cursor.execute(sql, (student_id, data['skill_name']))
        conn.commit()
        return jsonify({'success': True, 'message': 'Skill needed successfully!'}), 201
    finally:
        conn.close()

@app.route('/api/matches', methods=['GET'])
def get_matches():
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.callproc('sp_match_skills')
            conn.commit()
            sql = """
                SELECT 
                    mt.transaction_id, mt.status,
                    so.skill_name AS your_offered_skill,
                    so_partner.skill_name AS your_needed_skill,
                    s_partner.name AS partner_name,
                    s_partner.email AS partner_email
                FROM Matchmaking_Transaction mt
                JOIN Skill_Offered so ON mt.offer_id = so.offer_id
                JOIN Skill_Needed sn_partner ON mt.need_id = sn_partner.need_id
                JOIN Student s_user ON so.student_id = s_user.student_id
                JOIN Student s_partner ON sn_partner.student_id = s_partner.student_id
                JOIN Skill_Needed sn_user ON sn_user.student_id = s_user.student_id
                JOIN Skill_Offered so_partner ON so_partner.student_id = s_partner.student_id AND so_partner.skill_name = sn_user.skill_name
                WHERE s_user.student_id = %s AND mt.status != 'Unmatched'
                GROUP BY mt.transaction_id, so.skill_name, so_partner.skill_name, s_partner.name, s_partner.email
            """
            cursor.execute(sql, (student_id,))
            matches = cursor.fetchall()
            return jsonify({'matches': matches})
    finally:
        conn.close()

@app.route('/api/matches/<int:transaction_id>', methods=['GET'])
def get_match_details(transaction_id):
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql_partner = """
                SELECT s.student_id, s.name, s.email, so_partner.skill_name, so_partner.description, so_partner.media_url
                FROM Matchmaking_Transaction mt
                JOIN Skill_Offered so_user ON mt.offer_id = so_user.offer_id
                JOIN Skill_Needed sn_partner ON mt.need_id = sn_partner.need_id
                JOIN Student s ON sn_partner.student_id = s.student_id
                JOIN Skill_Offered so_partner ON s.student_id = so_partner.student_id
                JOIN Skill_Needed sn_user ON sn_user.student_id = so_user.student_id AND sn_user.skill_name = so_partner.skill_name
                WHERE mt.transaction_id = %s AND so_user.student_id = %s
                GROUP BY s.student_id, s.name, s.email, so_partner.skill_name, so_partner.description, so_partner.media_url
            """
            cursor.execute(sql_partner, (transaction_id, student_id))
            partner_details = cursor.fetchone()
            cursor.execute("SELECT * FROM Meetings WHERE transaction_id = %s ORDER BY meet_datetime DESC", (transaction_id,))
            meetings = cursor.fetchall()
            return jsonify({'partner': partner_details, 'meetings': meetings, 'current_user_id': student_id})
    finally:
        conn.close()

@app.route('/api/meetings/propose', methods=['POST'])
def propose_meet():
    student_id, _ = get_student_id_from_token()
    if not student_id: return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Meetings (transaction_id, proposed_by_id, meet_datetime, location_details) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (data['transaction_id'], student_id, data['meet_datetime'], data['location_details']))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting proposed!'}), 201
    finally:
        conn.close()

@app.route('/api/meetings/accept/<int:meet_id>', methods=['POST'])
def accept_meet(meet_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Meetings SET status = 'Confirmed' WHERE meet_id = %s", (meet_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting confirmed!'})
    finally:
        conn.close()

@app.route('/api/meetings/deny/<int:meet_id>', methods=['POST'])
def deny_meet(meet_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Meetings SET status = 'Cancelled' WHERE meet_id = %s", (meet_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting cancelled.'})
    finally:
        conn.close()

@app.route('/api/meetings/complete/<int:meet_id>', methods=['POST'])
def complete_meet(meet_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Meetings SET status = 'Completed' WHERE meet_id = %s", (meet_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Meeting marked as complete!'})
    finally:
        conn.close()

@app.route('/api/matches/unmatch', methods=['POST'])
def unmatch():
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE Matchmaking_Transaction SET status = 'Unmatched' WHERE transaction_id = %s", (data['transaction_id'],))
        conn.commit()
        return jsonify({'success': True, 'message': 'You have been unmatched.'})
    finally:
        conn.close()

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    from_student_id, _ = get_student_id_from_token()
    if not from_student_id: return jsonify({'error': 'Authentication required'}), 401
    data = request.get_json()
    to_student_id, rating, comments = data['to_student_id'], data['rating'], data['comments']
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO Feedback_Rating (from_student, to_student, rating, comments) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (from_student_id, to_student_id, rating, comments))
        conn.commit()
        return jsonify({'success': True, 'message': 'Feedback submitted successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/top-skills', methods=['GET'])
def get_top_skills():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.callproc('sp_top_skills')
            top_skills = cursor.fetchall()
            return jsonify({'success': True, 'top_skills': top_skills})
    finally:
        conn.close()


# ============================================
# NEW: ADMIN ROUTES
# ============================================
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data['username']
    password = data['password'] # NOTE: Your DB schema stores admin pass in plaintext.
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT admin_id, password FROM Admin WHERE username = %s"
            cursor.execute(sql, (username,))
            admin = cursor.fetchone()
            
            # WARNING: Plaintext password check. This is insecure but matches your schema.
            if admin and admin['password'] == password:
                token = jwt.encode({
                    'admin_id': admin['admin_id'],
                    'role': 'admin',
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, app.config['SECRET_KEY'], algorithm="HS256")
                return jsonify({'success': True, 'adminToken': token})
            else:
                return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    finally:
        conn.close()

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM Student")
            student_count = cursor.fetchone()['count']
            cursor.execute("SELECT COUNT(*) as count FROM Skill_Offered")
            offer_count = cursor.fetchone()['count']
            cursor.execute("SELECT COUNT(*) as count FROM Skill_Needed")
            need_count = cursor.fetchone()['count']
            cursor.execute("SELECT COUNT(*) as count FROM Matchmaking_Transaction WHERE status = 'Matched' OR status = 'Scheduled'")
            match_count = cursor.fetchone()['count']
            
            return jsonify({
                'students': student_count,
                'skills_offered': offer_count,
                'skills_needed': need_count,
                'active_matches': match_count
            })
    finally:
        conn.close()

@app.route('/api/admin/students', methods=['GET'])
@admin_required
def get_all_students():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT student_id, roll_number, name, email, department, contact FROM Student")
            students = cursor.fetchall()
            return jsonify({'students': students})
    finally:
        conn.close()

@app.route('/api/admin/skills', methods=['GET'])
@admin_required
def get_all_skills():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT skill_name, COUNT(*) as count FROM Skill_Offered GROUP BY skill_name ORDER BY count DESC")
            offered = cursor.fetchall()
            cursor.execute("SELECT skill_name, COUNT(*) as count FROM Skill_Needed GROUP BY skill_name ORDER BY count DESC")
            needed = cursor.fetchall()
            return jsonify({'offered': offered, 'needed': needed})
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True, port=5001)