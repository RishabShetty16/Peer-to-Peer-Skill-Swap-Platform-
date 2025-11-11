/*import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ============================================
// API Configuration
// ============================================
const API_URL = 'http://127.0.0.1:5001';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// Main App Component & Routing
// ============================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const logout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />
        <Routes>
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute element={DashboardPage} />} />
          <Route path="/skills" element={<ProtectedRoute element={SkillsPage} />} />
          <Route path="/matches" element={<ProtectedRoute element={MatchesListPage} />} />
          <Route path="/matches/:transaction_id" element={<ProtectedRoute element={MatchDetailsPage} />} />
          <Route path="/top-skills" element={<ProtectedRoute element={TopSkillsPage} />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const ProtectedRoute = ({ element: Component }) => (!!localStorage.getItem('token') ? <Component /> : <Navigate to="/login" />);

// ============================================
// Navigation Bar
// ============================================
const Navbar = ({ isAuthenticated, onLogout }) => (
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
    <h1 style={{ margin: 0, border: 'none', color: 'white' }}>SkillSwap</h1>
    <div>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
          <Link to="/skills" style={navLinkStyle}>My Skills</Link>
          <Link to="/matches" style={navLinkStyle}>Matches</Link>
          <Link to="/top-skills" style={navLinkStyle}>Top Skills</Link>
          <button onClick={onLogout} className="btn" style={{ marginLeft: '1rem' }}>Logout</button>
        </>
      )}
    </div>
  </nav>
);
const navLinkStyle = { color: 'var(--primary-text)', textDecoration: 'none', margin: '0 1rem', fontWeight: 'bold' };

// ============================================
// Auth Pages (Complete and Working)
// ============================================
function LoginPage({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };
  return (
    <div className="page-container"><h2>Student Login</h2><form onSubmit={handleSubmit} className="form-container"><div className="form-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="form-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div><button type="submit" className="btn">Login</button>{error && <p className="error-message">{error}</p>}<p style={{ textAlign: 'center' }}>Don't have an account? <Link to="/register" style={{ color: 'var(--accent-color)' }}>Register here</Link></p></form></div>
  );
}

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', department: '', password: '', contact: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', formData);
      if (response.data.success) {
        setMessage('Registration successful! Redirecting to login...');
        setError('');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
      setMessage('');
    }
  };
  return (
    <div className="page-container"><h2>Student Registration</h2><form onSubmit={handleSubmit} className="form-container"><input name="name" placeholder="Full Name" onChange={handleChange} required /><input name="email" type="email" placeholder="Email" onChange={handleChange} required /><input name="department" placeholder="Department (e.g., CSE)" onChange={handleChange} required /><input name="password" type="password" placeholder="Password" onChange={handleChange} required /><input name="contact" placeholder="Contact Number" onChange={handleChange} required /><button type="submit" className="btn">Register</button>{message && <p style={{ color: 'lightgreen', textAlign: 'center' }}>{message}</p>}{error && <p className="error-message">{error}</p>}</form></div>
  );
}

// ============================================
// CORE PAGES (DashboardPage is Updated)
// ============================================
function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        api.get('/api/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error("Dashboard fetch error:", err))
            .finally(() => setLoading(false));
    };
    useEffect(fetchData, []);

    const handleAccept = async (meet_id) => {
        await api.post(`/api/meetings/accept/${meet_id}`);
        fetchData(); // Refresh data
    };

    const handleDeny = async (meet_id) => {
        await api.post(`/api/meetings/deny/${meet_id}`);
        fetchData(); // Refresh data
    };

    if (loading || !data) return <p>Loading dashboard...</p>;
    const { student, offered_skills, needed_skills, upcoming_meets, pending_proposals, current_user_id } = data;

    return ( 
        <div className="page-container">
            <h2>Welcome, {student.name}!</h2>
            <div className="grid-container">
              
                <div className="card" style={{gridColumn: '1 / -1', backgroundColor: 'var(--tertiary-bg)'}}>
                    <h3>Meeting Proposals (For You)</h3>
                    {pending_proposals && pending_proposals.length > 0 ? pending_proposals.map(meet => (
                        <div key={meet.meet_id} style={{borderBottom: '1px solid var(--border-color)', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <p>From: <strong>{meet.proposer_name}</strong> (Swap: {meet.offered_skill} for {meet.needed_skill})</p>
                                <p>When: {new Date(meet.meet_datetime).toLocaleString()}</p>
                                <p>Where: {meet.location_details}</p>
                            </div>
                           
                            {meet.proposed_by_id !== current_user_id && (
                                <div style={{display: 'flex', gap: '10px', flexShrink: 0}}>
                                    <button className="btn" onClick={() => handleAccept(meet.meet_id)}>Accept</button>
                                    <button className="btn" onClick={() => handleDeny(meet.meet_id)} style={{backgroundColor: 'var(--error-color)'}}>Deny</button>
                                </div>
                            )}
                        </div>
                    )) : <p>No new meeting proposals.</p>}
                </div>

          
                <div className="card">
                    <h3>Confirmed Meets</h3>
                    {upcoming_meets && upcoming_meets.length > 0 ? upcoming_meets.map(meet => (
                        <div key={meet.meet_id} style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px'}}>
                            <p>With: <strong>{meet.partner_name}</strong></p>
                            <p>Swap: <strong>{meet.offered_skill}</strong> for <strong>{meet.needed_skill}</strong></p>
                            <p>When: {new Date(meet.meet_datetime).toLocaleString()}</p>
                            <p>Where: {meet.location_details}</p>
                        </div>
                    )) : <p>No upcoming meets scheduled.</p>}
                </div>
                <div className="card">
                    <h3>Skills You Offer</h3>
                    {offered_skills && offered_skills.length > 0 ? 
                        offered_skills.map(s => <p key={s.offer_id}>- {s.skill_name}</p>) :
                        <p>None yet.</p>
                    }
                </div>
                <div className="card">
                    <h3>Skills You Need</h3>
                    {needed_skills && needed_skills.length > 0 ? 
                        needed_skills.map(s => <p key={s.need_id}>- {s.skill_name}</p>) :
                        <p>None yet.</p>
                    }
                </div>
            </div>
        </div> 
    );
}

function SkillsPage() {
    const [offeredCount, setOfferedCount] = useState(0);
    const [message, setMessage] = useState('');
    useEffect(() => { api.get('/api/dashboard').then(res => { setOfferedCount(res.data.offered_skills.length); }); }, []);
    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setMessage('Uploading...');
        try {
            await api.post('/api/skills/offer', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage('Skill offered successfully!');
            setOfferedCount(prev => prev + 1);
            e.target.reset();
        } catch (error) { setMessage(`Error: ${error.response?.data?.error || 'Could not add skill.'}`); }
    };
    const handleNeedSubmit = async (e) => {
        e.preventDefault();
        const skill_name = e.target.skill_name.value;
        try {
            await api.post('/api/skills/need', { skill_name });
            setMessage('Skill needed successfully!');
            e.target.reset();
        } catch (error) { setMessage(`Error: ${error.response?.data?.error || 'Could not add skill.'}`); }
    };
    return ( <div className="page-container"><h2>Manage Your Skills</h2>{message && <p style={{textAlign: 'center'}}>{message}</p>}<div className="grid-container"><div><h3>Add a Skill You Can Offer</h3><form onSubmit={handleOfferSubmit} className="form-container" style={{ margin: '0' }}><input name="skill_name" placeholder="Skill Name" required /><textarea name="description" placeholder="Brief description" required /><label>Upload Supporting Media (Photo/Video)</label><input name="media" type="file" accept="image/png, image/jpeg, video/mp4" required /><button type="submit" className="btn">Offer Skill</button></form></div><div style={{ opacity: offeredCount > 0 ? 1 : 0.5 }}><h3>Add a Skill You Need</h3><form onSubmit={handleNeedSubmit} className="form-container" style={{ margin: '0' }}><input name="skill_name" placeholder="Skill Name" required disabled={offeredCount === 0} /><button type="submit" className="btn" disabled={offeredCount === 0}>Request Skill</button>{offeredCount === 0 && <p style={{color: 'var(--secondary-text)'}}>You must offer a skill first.</p>}</form></div></div></div> );
}

function MatchesListPage() {
    const [matches, setMatches] = useState([]);
    useEffect(() => { api.get('/api/matches').then(res => setMatches(res.data.matches)); }, []);
    return ( <div className="page-container"><h2>Your Matches</h2>{matches.length > 0 ? (<ul className="match-list">{matches.map(match => (<li key={match.transaction_id}><h3>Swap with {match.partner_name}</h3><p>You Offer: <strong>{match.your_offered_skill}</strong> | You Need: <strong>{match.your_needed_skill}</strong></p><Link to={`/matches/${match.transaction_id}`}><button className="btn">View Details & Schedule</button></Link></li>))}</ul>) : <p>No matches found yet. Try adding more offered/needed skills!</p>}</div> );
}

function MatchDetailsPage() {
    const { transaction_id } = useParams();
    const [details, setDetails] = useState(null);
    const [message, setMessage] = useState('');
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchDetails = () => { api.get(`/api/matches/${transaction_id}`).then(res => setDetails(res.data)); };
    useEffect(fetchDetails, [transaction_id]);

    const handlePropose = async (e) => { e.preventDefault(); await api.post('/api/meetings/propose', { transaction_id, meet_datetime: e.target.meet_datetime.value, location_details: e.target.location_details.value }); fetchDetails(); };
    const handleAccept = async (meet_id) => { await api.post(`/api/meetings/accept/${meet_id}`); fetchDetails(); };
    const handleDeny = async (meet_id) => { await api.post(`/api/meetings/deny/${meet_id}`); fetchDetails(); };
    const handleComplete = async (meet_id) => { await api.post(`/api/meetings/complete/${meet_id}`); fetchDetails(); };
    const handleUnmatch = async () => { if (window.confirm("Are you sure?")) { await api.post('/api/matches/unmatch', { transaction_id }); navigate('/matches'); } };
    const handleFeedbackSubmit = async (feedbackData) => {
        try {
            await api.post('/api/feedback', { ...feedbackData, to_student_id: details.partner.student_id });
            setMessage('Feedback submitted successfully!');
            setFeedbackModalOpen(false);
        } catch (err) { setMessage('Failed to submit feedback.'); }
    };

    if (!details || !details.partner) return <p>Loading match details...</p>;
    const { partner, meetings, current_user_id } = details;

    const hasCompletedMeet = meetings?.some(m => m.status === 'Completed');

    return (
        <div className="page-container">
            <h2>Swap Details with {partner.name}</h2>
            {message && <p style={{textAlign: 'center'}}>{message}</p>}
            <div className="grid-container">
                <div className="card"><h3>{partner.name} Offers: {partner.skill_name}</h3><p>{partner.description}</p>{partner.media_url && ((partner.media_url.endsWith('.mp4') || partner.media_url.endsWith('.mov')) ? <video width="100%" controls src={`${API_URL}/uploads/${partner.media_url}`} /> : <img width="100%" src={`${API_URL}/uploads/${partner.media_url}`} alt={partner.skill_name} />)}</div>
                <div className="card">
                    <h3>Meetings</h3>
                    {meetings && meetings.map(meet => (
                        <div key={meet.meet_id} className="card">
                            <p>Status: <strong style={{color: meet.status === 'Confirmed' ? 'lightgreen' : (meet.status === 'Cancelled' ? 'var(--error-color)' : 'white')}}>{meet.status}</strong></p>
                            <p>When: {new Date(meet.meet_datetime).toLocaleString()}</p>
                            {meet.status === 'Proposed' && meet.proposed_by_id !== current_user_id && (
                                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                    <button className="btn" onClick={() => handleAccept(meet.meet_id)}>Accept</button>
                                    <button className="btn" onClick={() => handleDeny(meet.meet_id)} style={{backgroundColor: 'var(--error-color)'}}>Deny</button>
                                </div>
                            )}
                            {meet.status === 'Proposed' && meet.proposed_by_id === current_user_id && <p><i>Waiting for partner to accept...</i></p>}
                            {meet.status === 'Confirmed' && <button className="btn" onClick={() => handleComplete(meet.meet_id)}>Mark as Complete</button>}
                        </div>
                    ))}
                    <h4>Propose a New Meet</h4>
                    <form onSubmit={handlePropose} className='form-container' style={{margin: 0, padding: 0}}><input name="meet_datetime" type="datetime-local" required /><input name="location_details" placeholder="Location or Online Link" required /><button type="submit" className="btn">Propose</button></form>
                </div>
            </div>
            <div style={{marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                {hasCompletedMeet && <button className="btn" onClick={() => setFeedbackModalOpen(true)}>Give Feedback</button>}
                <button className="btn" onClick={handleUnmatch} style={{backgroundColor: 'var(--error-color)'}}>End Swap</button>
            </div>
            {isFeedbackModalOpen && <FeedbackModal partnerName={partner.name} onSubmit={handleFeedbackSubmit} onClose={() => setFeedbackModalOpen(false)} />}
        </div>
    );
}

// --- NEW/RESTORED: Top Skills Page ---
function TopSkillsPage() {
    const [topSkills, setTopSkills] = useState([]);
    useEffect(() => { api.get('/api/top-skills').then(res => setTopSkills(res.data.top_skills)); }, []);
    return (
      <div className="page-container"><h2>Top 5 Most Demanded Skills</h2><ul className="top-skill-list">{topSkills.map(skill => (<li key={skill.skill_name}><span>{skill.skill_name}</span><span className="demand-badge">{skill.demand} requests</span></li>))}</ul></div>
    );
}

// --- NEW: Feedback Modal Component ---
function FeedbackModal({ partnerName, onSubmit, onClose }) {
  const [feedbackData, setFeedbackData] = useState({ rating: '5', comments: '' });
  const handleChange = (e) => { setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value }); };
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(feedbackData); };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <div style={{backgroundColor: 'var(--secondary-bg)', padding: '2rem', borderRadius: '8px', position: 'relative', width: '90%', maxWidth: '500px'}}>
        <button onClick={onClose} style={{position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
        <h3>Give Feedback for {partnerName}</h3>
        <form onSubmit={handleSubmit} className="form-container" style={{margin: 0}}>
            <label>Rating (1-5)</label>
            <select name="rating" value={feedbackData.rating} onChange={handleChange}>
                <option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Average</option><option value="2">2 - Fair</option><option value="1">1 - Poor</option>
            </select>
            <textarea name="comments" placeholder="Add comments..." value={feedbackData.comments} onChange={handleChange}></textarea>
            <button type="submit" className="btn">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}
*/


import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ============================================
// API Configuration
// ============================================
const API_URL = 'http://127.0.0.1:5001';
const api = axios.create({ baseURL: API_URL });

// Student API: Uses 'Authorization' header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API: Uses 'Admin-Authorization' header
const adminApi = axios.create({ baseURL: API_URL });
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers['Admin-Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// Main App Component & Routing
// ============================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(!!localStorage.getItem('adminToken'));

  const studentLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); };
  const adminLogout = () => { localStorage.removeItem('adminToken'); setIsAdminAuthenticated(false); };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          isAdmin={isAdminAuthenticated}
          onLogout={studentLogout} 
          onAdminLogout={adminLogout}
        />
        <Routes>
          {/* Student Routes */}
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute element={DashboardPage} />} />
          <Route path="/skills" element={<ProtectedRoute element={SkillsPage} />} />
          <Route path="/matches" element={<ProtectedRoute element={MatchesListPage} />} />
          <Route path="/matches/:transaction_id" element={<ProtectedRoute element={MatchDetailsPage} />} />
          <Route path="/top-skills" element={<ProtectedRoute element={TopSkillsPage} />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage setIsAdminAuthenticated={setIsAdminAuthenticated} />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute element={AdminDashboardPage} />} />
          
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ============================================
// Auth & Protection Components
// ============================================
const ProtectedRoute = ({ element: Component }) => (!!localStorage.getItem('token') ? <Component /> : <Navigate to="/login" />);
const AdminProtectedRoute = ({ element: Component }) => (!!localStorage.getItem('adminToken') ? <Component /> : <Navigate to="/admin/login" />);

// ============================================
// Navigation Bar (Updated)
// ============================================
const Navbar = ({ isAuthenticated, isAdmin, onLogout, onAdminLogout }) => (
  <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
    <h1 style={{ margin: 0, border: 'none', color: 'white' }}>SkillSwap {isAdmin && <span style={{color: 'var(--accent-color)', fontSize: '1rem'}}>(Admin)</span>}</h1>
    <div>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
          <Link to="/skills" style={navLinkStyle}>My Skills</Link>
          <Link to="/matches" style={navLinkStyle}>Matches</Link>
          <Link to="/top-skills" style={navLinkStyle}>Top Skills</Link>
          <button onClick={onLogout} className="btn" style={{ marginLeft: '1rem' }}>Logout</button>
        </>
      )}
      {isAdmin && !isAuthenticated && (
        <button onClick={onAdminLogout} className="btn" style={{ marginLeft: '1rem' }}>Admin Logout</button>
      )}
    </div>
  </nav>
);
const navLinkStyle = { color: 'var(--primary-text)', textDecoration: 'none', margin: '0 1rem', fontWeight: 'bold' };

// ============================================
// Student Auth Pages (Unchanged)
// ============================================
/*function LoginPage({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };
  return ( <div className="page-container"><h2>Student Login</h2><form onSubmit={handleSubmit} className="form-container"><div className="form-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="form-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div><button type="submit" className="btn">Login</button>{error && <p className="error-message">{error}</p>}<p style={{ textAlign: 'center' }}>Don't have an account? <Link to="/register" style={{ color: 'var(--accent-color)' }}>Register here</Link></p></form></div> );
}
*/
// Find and replace the entire LoginPage function
function LoginPage({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="page-container">
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn">Login</button>
        {error && <p className="error-message">{error}</p>}
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-color)' }}>Register here</Link>
        </p>
        
        {/* --- THIS IS THE NEW LINK --- */}
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/admin/login" style={{ color: 'var(--secondary-text)' }}>Login as Admin</Link>
        </p>
      </form>
    </div>
  );
}

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', department: '', password: '', contact: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', formData);
      if (response.data.success) {
        setMessage('Registration successful! Redirecting to login...');
        setError('');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
      setMessage('');
    }
  };
  return ( <div className="page-container"><h2>Student Registration</h2><form onSubmit={handleSubmit} className="form-container"><input name="name" placeholder="Full Name" onChange={handleChange} required /><input name="email" type="email" placeholder="Email" onChange={handleChange} required /><input name="department" placeholder="Department (e.g., CSE)" onChange={handleChange} required /><input name="password" type="password" placeholder="Password" onChange={handleChange} required /><input name="contact" placeholder="Contact Number" onChange={handleChange} required /><button type="submit" className="btn">Register</button>{message && <p style={{ color: 'lightgreen', textAlign: 'center' }}>{message}</p>}{error && <p className="error-message">{error}</p>}</form></div> );
}

// ============================================
// STUDENT CORE PAGES (DashboardPage is FIXED)
// ============================================
function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        api.get('/api/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error("Dashboard fetch error:", err))
            .finally(() => setLoading(false));
    };
    useEffect(fetchData, []);

    const handleAccept = async (meet_id) => {
        await api.post(`/api/meetings/accept/${meet_id}`);
        fetchData(); // Refresh data
    };

    const handleDeny = async (meet_id) => {
        await api.post(`/api/meetings/deny/${meet_id}`);
        fetchData(); // Refresh data
    };

    if (loading || !data) return <p>Loading dashboard...</p>;
    const { student, offered_skills, needed_skills, upcoming_meets, pending_proposals, current_user_id } = data;

    return ( 
        <div className="page-container">
            <h2>Welcome, {student.name}!</h2>
            <div className="grid-container">
                {/* *** FIXED: Proposals Card *** */}
                <div className="card" style={{gridColumn: '1 / -1', backgroundColor: 'var(--tertiary-bg)'}}>
                    <h3>Meeting Proposals (For You)</h3>
                    {pending_proposals && pending_proposals.length > 0 ? pending_proposals.map(meet => (
                        <div key={meet.meet_id} style={{borderBottom: '1px solid var(--border-color)', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <p>From: <strong>{meet.proposer_name}</strong></p>
                                {/* *** This is the fix *** */}
                                <p>Swap: <strong>{meet.user_needed_skill}</strong> (from them) for <strong>{meet.user_offered_skill}</strong> (from you)</p>
                                <p>When: {new Date(meet.meet_datetime).toLocaleString()}</p>
                                <p>Where: {meet.location_details}</p>
                            </div>
                            {meet.proposed_by_id !== current_user_id && (
                                <div style={{display: 'flex', gap: '10px', flexShrink: 0}}>
                                    <button className="btn" onClick={() => handleAccept(meet.meet_id)}>Accept</button>
                                    <button className="btn" onClick={() => handleDeny(meet.meet_id)} style={{backgroundColor: 'var(--error-color)'}}>Deny</button>
                                </div>
                            )}
                        </div>
                    )) : <p>No new meeting proposals.</p>}
                </div>

                {/* *** FIXED: Confirmed Meets Card *** */}
                <div className="card">
                    <h3>Confirmed Meets</h3>
                    {upcoming_meets && upcoming_meets.length > 0 ? upcoming_meets.map(meet => (
                        <div key={meet.meet_id} style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px'}}>
                            <p>With: <strong>{meet.partner_name}</strong></p>
                             {/* *** This is the fix *** */}
                            <p>Swap: <strong>{meet.user_offered_skill}</strong> for <strong>{meet.user_needed_skill}</strong></p>
                            <p>When: {new Date(meet.meet_datetime).toLocaleString()}</p>
                            <p>Where: {meet.location_details}</p>
                        </div>
                    )) : <p>No upcoming meets scheduled.</p>}
                </div>
                <div className="card">
                    <h3>Skills You Offer</h3>
                    {offered_skills && offered_skills.length > 0 ? 
                        offered_skills.map(s => <p key={s.offer_id}>- {s.skill_name}</p>) :
                        <p>None yet.</p>
                    }
                </div>
                <div className="card">
                    <h3>Skills You Need</h3>
                    {needed_skills && needed_skills.length > 0 ? 
                        needed_skills.map(s => <p key={s.need_id}>- {s.skill_name}</p>) :
                        <p>None yet.</p>
                    }
                </div>
            </div>
        </div> 
    );
}

function SkillsPage() {
    const [offeredCount, setOfferedCount] = useState(0);
    const [message, setMessage] = useState('');
    useEffect(() => { api.get('/api/dashboard').then(res => { setOfferedCount(res.data.offered_skills.length); }); }, []);
    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setMessage('Uploading...');
        try {
            await api.post('/api/skills/offer', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage('Skill offered successfully!');
            setOfferedCount(prev => prev + 1);
            e.target.reset();
        } catch (error) { setMessage(`Error: ${error.response?.data?.error || 'Could not add skill.'}`); }
    };
    const handleNeedSubmit = async (e) => {
        e.preventDefault();
        const skill_name = e.target.skill_name.value;
        try {
            await api.post('/api/skills/need', { skill_name });
            setMessage('Skill needed successfully!');
            e.target.reset();
        } catch (error) { setMessage(`Error: ${error.response?.data?.error || 'Could not add skill.'}`); }
    };
    return ( <div className="page-container"><h2>Manage Your Skills</h2>{message && <p style={{textAlign: 'center'}}>{message}</p>}<div className="grid-container"><div><h3>Add a Skill You Can Offer</h3><form onSubmit={handleOfferSubmit} className="form-container" style={{ margin: '0' }}><input name="skill_name" placeholder="Skill Name" required /><textarea name="description" placeholder="Brief description" required /><label>Upload Supporting Media (Photo/Video)</label><input name="media" type="file" accept="image/png, image/jpeg, video/mp4" required /><button type="submit" className="btn">Offer Skill</button></form></div><div style={{ opacity: offeredCount > 0 ? 1 : 0.5 }}><h3>Add a Skill You Need</h3><form onSubmit={handleNeedSubmit} className="form-container" style={{ margin: '0' }}><input name="skill_name" placeholder="Skill Name" required disabled={offeredCount === 0} /><button type="submit" className="btn" disabled={offeredCount === 0}>Request Skill</button>{offeredCount === 0 && <p style={{color: 'var(--secondary-text)'}}>You must offer a skill first.</p>}</form></div></div></div> );
}

function MatchesListPage() {
    const [matches, setMatches] = useState([]);
    useEffect(() => { api.get('/api/matches').then(res => setMatches(res.data.matches)); }, []);
    return ( <div className="page-container"><h2>Your Matches</h2>{matches.length > 0 ? (<ul className="match-list">{matches.map(match => (<li key={match.transaction_id}><h3>Swap with {match.partner_name}</h3><p>You Offer: <strong>{match.your_offered_skill}</strong> | You Need: <strong>{match.your_needed_skill}</strong></p><Link to={`/matches/${match.transaction_id}`}><button className="btn">View Details & Schedule</button></Link></li>))}</ul>) : <p>No matches found yet. Try adding more offered/needed skills!</p>}</div> );
}

function MatchDetailsPage() {
    const { transaction_id } = useParams();
    const [details, setDetails] = useState(null);
    const [message, setMessage] = useState('');
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const navigate = useNavigate();
    const fetchDetails = () => { api.get(`/api/matches/${transaction_id}`).then(res => setDetails(res.data)); };
    useEffect(fetchDetails, [transaction_id]);
    const handlePropose = async (e) => { e.preventDefault(); await api.post('/api/meetings/propose', { transaction_id, meet_datetime: e.target.meet_datetime.value, location_details: e.target.location_details.value }); fetchDetails(); };
    const handleAccept = async (meet_id) => { await api.post(`/api/meetings/accept/${meet_id}`); fetchDetails(); };
    const handleDeny = async (meet_id) => { await api.post(`/api/meetings/deny/${meet_id}`); fetchDetails(); };
    const handleComplete = async (meet_id) => { await api.post(`/api/meetings/complete/${meet_id}`); fetchDetails(); };
    const handleUnmatch = async () => { if (window.confirm("Are you sure?")) { await api.post('/api/matches/unmatch', { transaction_id }); navigate('/matches'); } };
    const handleFeedbackSubmit = async (feedbackData) => {
        try {
            await api.post('/api/feedback', { ...feedbackData, to_student_id: details.partner.student_id });
            setMessage('Feedback submitted successfully!');
            setFeedbackModalOpen(false);
        } catch (err) { setMessage('Failed to submit feedback.'); }
    };
    if (!details || !details.partner) return <p>Loading match details...</p>;
    const { partner, meetings, current_user_id } = details;
    const hasCompletedMeet = meetings?.some(m => m.status === 'Completed');
    return (
        <div className="page-container">
            <h2>Swap Details with {partner.name}</h2>
            {message && <p style={{textAlign: 'center'}}>{message}</p>}
            <div className="grid-container">
                <div className="card"><h3>{partner.name} Offers: {partner.skill_name}</h3><p>{partner.description}</p>{partner.media_url && ((partner.media_url.endsWith('.mp4') || partner.media_url.endsWith('.mov')) ? <video width="100%" controls src={`${API_URL}/uploads/${partner.media_url}`} /> : <img width="100%" src={`${API_URL}/uploads/${partner.media_url}`} alt={partner.skill_name} />)}</div>
                <div className="card">
                    <h3>Meetings</h3>
                    {meetings && meetings.map(meet => (
                        <div key={meet.meet_id} className="card">
                            <p>Status: <strong style={{color: meet.status === 'Confirmed' ? 'lightgreen' : (meet.status === 'Cancelled' ? 'var(--error-color)' : 'white')}}>{meet.status}</strong></p>
                            <p>When: {new Date(meet.meet_datetime).toLocaleString()}</p>
                            {meet.status === 'Proposed' && meet.proposed_by_id !== current_user_id && (
                                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                    <button className="btn" onClick={() => handleAccept(meet.meet_id)}>Accept</button>
                                    <button className="btn" onClick={() => handleDeny(meet.meet_id)} style={{backgroundColor: 'var(--error-color)'}}>Deny</button>
                                </div>
                            )}
                            {meet.status === 'Proposed' && meet.proposed_by_id === current_user_id && <p><i>Waiting for partner to accept...</i></p>}
                            {meet.status === 'Confirmed' && <button className="btn" onClick={() => handleComplete(meet.meet_id)}>Mark as Complete</button>}
                        </div>
                    ))}
                    <h4>Propose a New Meet</h4>
                    <form onSubmit={handlePropose} className='form-container' style={{margin: 0, padding: 0}}><input name="meet_datetime" type="datetime-local" required /><input name="location_details" placeholder="Location or Online Link" required /><button type="submit" className="btn">Propose</button></form>
                </div>
            </div>
            <div style={{marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                {hasCompletedMeet && <button className="btn" onClick={() => setFeedbackModalOpen(true)}>Give Feedback</button>}
                <button className="btn" onClick={handleUnmatch} style={{backgroundColor: 'var(--error-color)'}}>End Swap</button>
            </div>
            {isFeedbackModalOpen && <FeedbackModal partnerName={partner.name} onSubmit={handleFeedbackSubmit} onClose={() => setFeedbackModalOpen(false)} />}
        </div>
    );
}

function TopSkillsPage() {
    const [topSkills, setTopSkills] = useState([]);
    useEffect(() => { api.get('/api/top-skills').then(res => setTopSkills(res.data.top_skills)); }, []);
    return (
      <div className="page-container"><h2>Top 5 Most Demanded Skills</h2><ul className="top-skill-list">{topSkills.map(skill => (<li key={skill.skill_name}><span>{skill.skill_name}</span><span className="demand-badge">{skill.demand} requests</span></li>))}</ul></div>
    );
}

function FeedbackModal({ partnerName, onSubmit, onClose }) {
  const [feedbackData, setFeedbackData] = useState({ rating: '5', comments: '' });
  const handleChange = (e) => { setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value }); };
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(feedbackData); };
  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <div style={{backgroundColor: 'var(--secondary-bg)', padding: '2rem', borderRadius: '8px', position: 'relative', width: '90%', maxWidth: '500px'}}>
        <button onClick={onClose} style={{position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
        <h3>Give Feedback for {partnerName}</h3>
        <form onSubmit={handleSubmit} className="form-container" style={{margin: 0}}>
            <label>Rating (1-5)</label>
            <select name="rating" value={feedbackData.rating} onChange={handleChange}>
                <option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value_3="3">3 - Average</option><option value_2="2">2 - Fair</option><option value="1">1 - Poor</option>
            </select>
            <textarea name="comments" placeholder="Add comments..." value={feedbackData.comments} onChange={handleChange}></textarea>
            <button type="submit" className="btn">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// NEW: ADMIN PAGES
// ============================================
function AdminLoginPage({ setIsAdminAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use the base axios, not the interceptor
            const response = await axios.post(`${API_URL}/admin/login`, { username, password });
            if (response.data.adminToken) {
                localStorage.setItem('adminToken', response.data.adminToken);
                setIsAdminAuthenticated(true);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed.');
        }
    };
    return ( <div className="page-container"><h2>Admin Login</h2><form onSubmit={handleSubmit} className="form-container"><div className="form-group"><label>Username</label><input value={username} onChange={e => setUsername(e.target.value)} required /></div><div className="form-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div><button type="submit" className="btn">Login</button>{error && <p className="error-message">{error}</p>}</form></div> );
}

function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [skills, setSkills] = useState({ offered: [], needed: [] });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        adminApi.get('/api/admin/stats').then(res => setStats(res.data));
        adminApi.get('/api/admin/students').then(res => setStudents(res.data.students));
        adminApi.get('/api/admin/skills').then(res => setSkills(res.data));
    }, []);

    const filteredStudents = useMemo(() => {
        return students.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    if (!stats) return <p>Loading admin data...</p>;

    return (
        <div className="page-container">
            <h2>Admin Dashboard</h2>
            <div className="grid-container" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                <div className="card"><h3>Total Students</h3><p style={{fontSize: '2rem'}}>{stats.students}</p></div>
                <div className="card"><h3>Skills Offered</h3><p style={{fontSize: '2rem'}}>{stats.skills_offered}</p></div>
                <div className="card"><h3>Skills Needed</h3><p style={{fontSize: '2rem'}}>{stats.skills_needed}</p></div>
                <div className="card"><h3>Active Matches</h3><p style={{fontSize: '2rem'}}>{stats.active_matches}</p></div>
            </div>

            <div className="card" style={{marginTop: '2rem'}}>
                <h3>All Students</h3>
                <input 
                    type="text" 
                    placeholder="Search by name, email, or roll number..." 
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{width: '100%', boxSizing: 'border-box', marginBottom: '1rem'}}
                />
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{borderBottom: '2px solid var(--accent-color)'}}>
                            <th style={tableHeaderStyle}>Roll No.</th>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style_={tableHeaderStyle}>Email</th>
                            <th style={tableHeaderStyle}>Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(s => (
                            <tr key={s.student_id} style={{borderBottom: '1Gpx solid var(--border-color)'}}>
                                <td style={tableCellStyle}>{s.roll_number}</td>
                                <td style={tableCellStyle}>{s.name}</td>
                                <td style={tableCellStyle}>{s.email}</td>
                                <td style={tableCellStyle}>{s.department}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid-container" style={{marginTop: '2rem'}}>
                <div className="card">
                    <h3>Top Offered Skills</h3>
                    <ul className="top-skill-list">{skills.offered.map(s => <li key={s.skill_name}><span>{s.skill_name}</span><span className="demand-badge">{s.count}</span></li>)}</ul>
                </div>
                <div className="card">
                    <h3>Top Needed Skills</h3>
                    <ul className="top-skill-list">{skills.needed.map(s => <li key={s.skill_name}><span>{s.skill_name}</span><span className="demand-badge">{s.count}</span></li>)}</ul>
                </div>
            </div>
        </div>
    );
}

// Admin table styles
const tableHeaderStyle = { padding: '0.5rem', textAlign: 'left' };
const tableCellStyle = { padding: '0.5rem' };