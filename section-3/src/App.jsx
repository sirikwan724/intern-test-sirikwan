import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Guard from './components/Guard';
import AdminPage from './pages/AdminPage';
import EmployeePage from './pages/EmployeePage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<Guard role="admin"><AdminPage /></Guard>} />
      <Route path="/employee" element={<Guard role="employee"><EmployeePage /></Guard>} />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
    </Routes>
  );
}
