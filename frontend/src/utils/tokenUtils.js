// src/utils/tokenUtils.js
import { jwtDecode } from 'jwt-decode';

// Token storage utilities

export const setToken = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const removeToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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