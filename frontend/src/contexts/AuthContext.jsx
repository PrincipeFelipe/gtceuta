// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser, checkAuthStatus } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (checkAuthStatus()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error al verificar autenticación', error);
          logoutUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    loginUser,
    logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};