import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token || !user) return <Navigate to="/login" replace />;

  const role =
    user?.Роль?.toLowerCase() ||
    user?.ВидКонтрагента?.toLowerCase() ||
    user?.counterparty_type?.toLowerCase() ||
    '';

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
