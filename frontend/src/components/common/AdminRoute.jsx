// src/components/common/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;