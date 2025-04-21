import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró (401) o no tiene permisos (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Solo redirigimos y limpiamos tokens si no estamos en la página de login
      if (window.location.pathname !== '/login') {
        removeToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;