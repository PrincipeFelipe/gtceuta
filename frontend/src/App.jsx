import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import './styles/global.css'; // Solo importamos los estilos globales

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/users/UsersPage';
import UserCreatePage from './pages/users/UserCreatePage';
import UserEditPage from './pages/users/UserEditPage';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            
            <Route path="/users" element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            } />
            
            <Route path="/users/create" element={
              <AdminRoute>
                <UserCreatePage />
              </AdminRoute>
            } />
            
            <Route path="/users/edit/:id" element={
              <AdminRoute>
                <UserEditPage />
              </AdminRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
