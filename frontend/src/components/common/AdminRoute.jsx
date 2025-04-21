// src/components/common/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verifica si el usuario es administrador
  if (user && user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;