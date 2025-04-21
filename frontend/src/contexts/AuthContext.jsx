// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { isTokenValid } from '../utils/tokenUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isTokenValid()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Error obteniendo datos del usuario:', err);
          setError(err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginUser, logoutUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};