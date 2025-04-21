// src/utils/tokenUtils.js
import { jwtDecode } from 'jwt-decode';

export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const removeToken = () => {
  localStorage.removeItem('authToken');
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};