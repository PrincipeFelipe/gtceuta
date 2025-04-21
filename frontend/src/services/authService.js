// src/services/authService.js
import api from './api';
import { setToken, removeToken } from '../utils/tokenUtils';

export const login = async (credentials) => {
  try {
    const response = await api.post('/token/', credentials);
    setToken(response.data.access);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Error en la autenticación' };
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
    throw error;
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