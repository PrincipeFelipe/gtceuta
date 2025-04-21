// src/services/authService.js
import api from './api';
import { setToken, removeToken, getToken } from '../utils/tokenUtils';

export const login = async (credentials) => {
  try {
    // Ajusta esta ruta según la configuración de tu backend
    const response = await api.post('/token/', credentials);
    // O alternativa:
    // const response = await api.post('/users/login/', credentials);
    
    const { access, refresh } = response.data;
    setToken(access, refresh);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error en el servidor' };
  }
};

export const logout = () => {
  removeToken();
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error al obtener datos del usuario' };
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    setToken(response.data.access);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkAuthStatus = () => {
  const token = getToken();
  return !!token;
};