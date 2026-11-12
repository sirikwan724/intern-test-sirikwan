import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import { employees, mockApi } from '../mockApi';

export default function AdminPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(String(employees[0].id));
  const location = useLocation();
  const notice = location.state?.denied
    ? `หน้านี้สำหรับ ${location.state.denied} — ระบบพาคุณมายังหน้าของคุณแล้ว`
    : '';

  useEffect(() => {
    mockApi.getTasks(token)
      .then((items) => setTasks(items.map((task) => ({
        ...task,
        assigneeName: employees.find((employee) => employee.id === task.assignedTo)?.displayName,
      }))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function createTask(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await mockApi.createTask(token, { title, assignedTo });
      setTasks((current) => [{
        ...created,
        assigneeName: employees.find((employee) => employee.id === created.assignedTo)?.displayName,
      }, ...current]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <main className="page-shell">
        {notice && <p className="alert info">{notice}</p>}
        <div className="page-heading">
          <div><p className="eyebrow">OVERVIEW</p><h1>จัดการ Task</h1><p className="muted">ภาพรวมงานทั้งหมดในโครงการ</p></div>
          <div className="count-card"><strong>{tasks.length}</strong><span>Tasks ทั้งหมด</span></div>
        </div>
        {error && <p className="alert error" role="alert">{error}</p>}
        <section className="panel">
          <div className="section-title"><div><p className="eyebrow">NEW TASK</p><h2>สร้าง Task</h2></div></div>
          <form className="create-form" onSubmit={createTask}>
            <label>ชื่อ Task<input required maxLength="120" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="เช่น เตรียมสรุปความคืบหน้า" /></label>
            <label>มอบหมายให้
              <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
                {employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.displayName}</option>)}
              </select>
            </label>
            <button className="primary" disabled={saving}>{saving ? 'กำลังสร้าง…' : '+ เพิ่ม Task'}</button>
          </form>
        </section>
        <section className="task-section">
          <div className="section-title"><div><p className="eyebrow">ALL WORK</p><h2>Task ทั้งหมด</h2></div></div>
          {loading ? <p className="loading">กำลังโหลด Task…</p> : <TaskList tasks={tasks} />}
        </section>
      </main>
    </>
  );
}
