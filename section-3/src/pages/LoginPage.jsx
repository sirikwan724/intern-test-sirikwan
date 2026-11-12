import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { demoAccounts, mockApi } from '../mockApi';

export default function LoginPage() {
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

  return (
    <main className="login-card">
      <div className="brand-mark">PT</div>
      <p className="eyebrow">PROJECT WORKSPACE</p>
      <h1>เข้าสู่ระบบ</h1>
      <p className="muted">เลือกบัญชีเพื่อทดลองระบบจัดการ Task</p>
      <form onSubmit={submit} className="stack">
        <label htmlFor="username">บัญชีผู้ใช้</label>
        <select id="username" value={username} onChange={(event) => setUsername(event.target.value)}>
          {demoAccounts.map((account) => (
            <option value={account.username} key={account.id}>
              {account.displayName} · {account.role}
            </option>
          ))}
          <option value="unknown-user">บัญชีทดสอบ error (ไม่มีในระบบ)</option>
        </select>
        {error && <p className="alert error" role="alert">{error}</p>}
        <button className="primary" disabled={loading}>
          {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
      <p className="hint">ทดสอบกรณี error ได้โดยเลือก “บัญชีทดสอบ error” แล้วกดเข้าสู่ระบบ</p>
    </main>
  );
}
