import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'editor' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = 'admin' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Agregar logs para depuración
  console.log("ProtectedRoute - Auth Status:", { 
    isAuthenticated, 
    user, 
    userRole: user?.role, // Usar user.role en lugar de userRole
    loading, 
    requiredRole 
  });

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    console.log("No autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }
  
  // Verificar el rol del usuario - AQUÍ ESTÁ EL CAMBIO PRINCIPAL
  if (requiredRole && user.role !== requiredRole) {
    console.log(`Rol requerido: ${requiredRole}, Rol del usuario: ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // El usuario está autenticado y autorizado
  console.log("Usuario autorizado, mostrando contenido protegido");
  return <Outlet />;
};

export default ProtectedRoute;