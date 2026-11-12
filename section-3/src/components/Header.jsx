import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function logout() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="topbar">
      <Link to={`/${user.role}`} className="wordmark">
        <span className="brand-mark small">PT</span> Project Tasks
      </Link>
      <div className="profile">
        <span>{user.displayName}</span>
        <span className="role-pill">{user.role}</span>
        <button className="text-button" onClick={logout}>ออกจากระบบ</button>
      </div>
    </header>
  );
}
