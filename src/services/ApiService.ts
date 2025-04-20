import { API_URL } from '../config/api';
import authService from './AuthService';

export default class ApiService {
  private static buildUrl(endpoint: string): string {
    // Asegurarse de que no haya duplicación de 'api' en las rutas
    if (endpoint.startsWith('/api/') && API_URL.endsWith('/api')) {
      endpoint = endpoint.substring(4);
    }
    
    // Asegurarse de que hay un / entre la base y el endpoint
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseUrl}${path}`;
  }

  static async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  static async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }
  
  // Añadir otros métodos HTTP según sea necesario (PUT, DELETE, etc.)

  static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Añadir token si hay uno disponible
    const token = localStorage.getItem('accessToken');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await fetch(url, options);
    
    // Manejar errores de autenticación
    if (response.status === 401) {
      const refreshed = await authService.refreshToken();
      if (refreshed) {
        // Reintentar con el nuevo token
        const newToken = localStorage.getItem('accessToken');
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        };
        return this.request<T>(url, options);
      } else {
        // Si no se pudo refrescar, cerrar sesión
        authService.logout();
        throw new Error('La sesión ha expirado. Por favor vuelve a iniciar sesión.');
      }
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}