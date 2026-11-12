import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import { mockApi } from '../mockApi';

export default function EmployeePage() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const location = useLocation();
  const notice = location.state?.denied
    ? `หน้านี้สำหรับ ${location.state.denied} — ระบบพาคุณมายังหน้าของคุณแล้ว`
    : '';

  useEffect(() => {
    mockApi.getTasks(token)
      .then((items) => setTasks(items.map((task) => ({ ...task, assigneeName: user.displayName }))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, user.displayName]);

  async function markDone(task) {
    setBusyId(task.id);
    setError('');
    try {
      const updated = await mockApi.updateStatus(token, task.id, 'Done');
      setTasks((current) => current.map((item) => item.id === updated.id
        ? { ...updated, assigneeName: user.displayName }
        : item));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const visible = tasks.filter((task) => task.assignedTo === user.id
    && (filter === 'All' || task.status === filter));

  return (
    <>
      <Header />
      <main className="page-shell">
        {notice && <p className="alert info">{notice}</p>}
        <div className="page-heading">
          <div><p className="eyebrow">MY WORKSPACE</p><h1>สวัสดี, {user.displayName.split(' ')[0]}</h1><p className="muted">งานที่ได้รับมอบหมายให้คุณ</p></div>
          <div className="count-card"><strong>{visible.length}</strong><span>Tasks ที่แสดง</span></div>
        </div>
        {error && <p className="alert error" role="alert">{error}</p>}
        <section className="task-section">
          <div className="section-title">
            <div><p className="eyebrow">MY TASKS</p><h2>รายการงาน</h2></div>
            <label className="filter-label">สถานะ
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option>All</option><option>To Do</option><option>Done</option>
              </select>
            </label>
          </div>
          {loading ? <p className="loading">กำลังโหลด Task…</p> : <TaskList tasks={visible} onDone={markDone} busyId={busyId} />}
        </section>
      </main>
    </>
  );
}
