import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { demoAccounts, employees, mockApi } from './mockApi';
import { useAuth } from './AuthContext';

function LoginPage() {
  const { user, signIn } = useAuth();
  const [username, setUsername] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  if (user) return <Navigate to={`/${user.role}`} replace />;

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await mockApi.login(username);
      signIn(session);
      navigate(`/${session.user.role}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <main className="login-card">
    <div className="brand-mark">PT</div>
    <p className="eyebrow">PROJECT WORKSPACE</p>
    <h1>เข้าสู่ระบบ</h1>
    <p className="muted">เลือกบัญชีเพื่อทดลองระบบจัดการ Task</p>
    <form onSubmit={submit} className="stack">
      <label htmlFor="username">บัญชีผู้ใช้</label>
      <select id="username" value={username} onChange={(event) => setUsername(event.target.value)}>
        {demoAccounts.map((account) => <option value={account.username} key={account.id}>
          {account.displayName} · {account.role}
        </option>)}
        <option value="unknown-user">บัญชีทดสอบ error (ไม่มีในระบบ)</option>
      </select>
      {error && <p className="alert error" role="alert">{error}</p>}
      <button className="primary" disabled={loading}>{loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}</button>
    </form>
    <p className="hint">ทดสอบ error ได้โดยเลือก “ระบุชื่อเอง” และใส่ชื่อที่ไม่มีในระบบ</p>
  </main>;
}

function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return <header className="topbar">
    <Link to={`/${user.role}`} className="wordmark"><span className="brand-mark small">PT</span> Project Tasks</Link>
    <div className="profile"><span>{user.displayName}</span><span className="role-pill">{user.role}</span>
      <button className="text-button" onClick={() => { signOut(); navigate('/login', { replace: true }); }}>ออกจากระบบ</button>
    </div>
  </header>;
}

function Guard({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace state={{ denied: role }} />;
  return children;
}

function useNotice() {
  const location = useLocation();
  if (location.state?.denied) return `หน้านี้สำหรับ ${location.state.denied} — ระบบพาคุณมายังหน้าของคุณแล้ว`;
  return '';
}

function TaskList({ tasks, onDone, busyId }) {
  if (!tasks.length) return <div className="empty">ยังไม่มี Task ในสถานะนี้</div>;
  return <div className="task-list">{tasks.map((task) => <article className="task-card" key={task.id}>
    <div className="task-icon">✓</div>
    <div className="task-content"><div className="task-project">{task.project}</div><h3>{task.title}</h3>
      <div className="task-meta">ผู้รับผิดชอบ: {task.assigneeName}</div>
    </div>
    <span className={`status ${task.status === 'Done' ? 'done' : ''}`}>{task.status}</span>
    {onDone && task.status === 'To Do' && <button className="complete-button" disabled={busyId === task.id} onClick={() => onDone(task)}>
      {busyId === task.id ? 'กำลังบันทึก…' : 'ทำเสร็จแล้ว'}
    </button>}
  </article>)}</div>;
}

function AdminPage() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(String(employees[0].id));
  const notice = useNotice();

  useEffect(() => {
    mockApi.getTasks(token).then((items) => setTasks(items.map((task) => ({
      ...task, assigneeName: employees.find((employee) => employee.id === task.assignedTo)?.displayName,
    })))).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [token]);

  async function createTask(event) {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      const created = await mockApi.createTask(token, { title, assignedTo });
      setTasks((current) => [{ ...created, assigneeName: employees.find((employee) => employee.id === created.assignedTo)?.displayName }, ...current]);
      setTitle('');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return <><Header /><main className="page-shell">
    {notice && <p className="alert info">{notice}</p>}
    <div className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>จัดการ Task</h1><p className="muted">ภาพรวมงานทั้งหมดในโครงการ</p></div><div className="count-card"><strong>{tasks.length}</strong><span>Tasks ทั้งหมด</span></div></div>
    {error && <p className="alert error">{error}</p>}
    <section className="panel"><div className="section-title"><div><p className="eyebrow">NEW TASK</p><h2>สร้าง Task</h2></div></div>
      <form className="create-form" onSubmit={createTask}>
        <label>ชื่อ Task<input required maxLength="120" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="เช่น เตรียมสรุปความคืบหน้า" /></label>
        <label>มอบหมายให้<select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>{employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.displayName}</option>)}</select></label>
        <button className="primary" disabled={saving}>{saving ? 'กำลังสร้าง…' : '+ เพิ่ม Task'}</button>
      </form>
    </section>
    <section className="task-section"><div className="section-title"><div><p className="eyebrow">ALL WORK</p><h2>Task ทั้งหมด</h2></div></div>
      {loading ? <p className="loading">กำลังโหลด Task…</p> : <TaskList tasks={tasks} />}
    </section>
  </main></>;
}

function EmployeePage() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const notice = useNotice();

  useEffect(() => {
    mockApi.getTasks(token).then((items) => setTasks(items.map((task) => ({ ...task, assigneeName: user.displayName }))))
      .catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [token, user.displayName]);

  async function markDone(task) {
    setBusyId(task.id); setError('');
    try {
      const updated = await mockApi.updateStatus(token, task.id, 'Done');
      setTasks((current) => current.map((item) => item.id === updated.id ? { ...updated, assigneeName: user.displayName } : item));
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  }

  const visible = tasks.filter((task) => task.assignedTo === user.id && (filter === 'All' || task.status === filter));
  return <><Header /><main className="page-shell">
    {notice && <p className="alert info">{notice}</p>}
    <div className="page-heading"><div><p className="eyebrow">MY WORKSPACE</p><h1>สวัสดี, {user.displayName.split(' ')[0]}</h1><p className="muted">งานที่ได้รับมอบหมายให้คุณ</p></div><div className="count-card"><strong>{visible.length}</strong><span>Tasks ที่แสดง</span></div></div>
    {error && <p className="alert error" role="alert">{error}</p>}
    <section className="task-section"><div className="section-title"><div><p className="eyebrow">MY TASKS</p><h2>รายการงาน</h2></div>
      <label className="filter-label">สถานะ<select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>To Do</option><option>Done</option></select></label></div>
      {loading ? <p className="loading">กำลังโหลด Task…</p> : <TaskList tasks={visible} onDone={markDone} busyId={busyId} />}
    </section>
  </main></>;
}

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/admin" element={<Guard role="admin"><AdminPage /></Guard>} />
    <Route path="/employee" element={<Guard role="employee"><EmployeePage /></Guard>} />
    <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
  </Routes>;
}
