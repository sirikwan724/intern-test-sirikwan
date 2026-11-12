import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    const refresh = async (initial = false) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (initial) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await api.getTasks(token);
        if (active) {
          setTasks(data.tasks.filter((task) => String(task.assigned_to) === String(user.id)));
          setError('');
        }
      } catch (err) {
        if (active) setError('โหลดรายการ Task ไม่สำเร็จ กรุณาลองใหม่');
      } finally {
        inFlight.current = false;
        if (active) { setLoading(false); setRefreshing(false); }
      }
    };

    refresh(true);
    const timer = window.setInterval(() => refresh(false), 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, [token, user.id]);

  const markDone = async (task) => {
    if (pendingIds.has(task.id) || task.status !== 'To Do') return;
    setError('');
    setPendingIds((current) => new Set(current).add(task.id));
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: 'Done' } : item));

    try {
      const savedTask = await api.updateStatus(token, task.id, 'Done');
      setTasks((current) => current.map((item) => String(item.id) === String(savedTask.id) ? savedTask : item));
    } catch (err) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: task.status } : item));
      setError('อัปเดตไม่สำเร็จ รายการถูกคืนเป็นสถานะเดิม');
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  };

  const visible = tasks.filter(
    (task) => String(task.assigned_to) === String(user.id) && (filter === 'All' || task.status === filter),
  );

  return (
    <div className="page">
      <label>
        สถานะ
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option>All</option>
          <option>To Do</option>
          <option>Done</option>
        </select>
      </label>

      {loading && <p>กำลังโหลด...</p>}
      {!loading && refreshing && <p>กำลังตรวจสอบรายการล่าสุด...</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {!loading && (
        <ul>
          {visible.map((task) => (
            <li key={task.id}>
              {task.title} — {task.status}
              {task.status === 'To Do' && (
                <button disabled={pendingIds.has(task.id)} onClick={() => markDone(task)}>
                  {pendingIds.has(task.id) ? 'กำลังบันทึก...' : 'เปลี่ยนเป็น Done'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
