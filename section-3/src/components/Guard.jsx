import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Guard({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace state={{ denied: role }} />;
  return children;
}
