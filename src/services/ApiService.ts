import { API_URL } from '../config/api';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  isFormData?: boolean;
}

class ApiService {
  async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, isFormData = false, ...fetchOptions } = options;
    
    // Preparar headers
    const headers: Record<string, string> = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (requiresAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Construir la URL completa asegurándose que no haya duplicación de /api
    const url = endpoint.startsWith('http') 
      ? endpoint
      : endpoint.startsWith('/') 
        ? `${API_URL}${endpoint}` 
        : `${API_URL}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers
        }
      });
      
      // Manejar errores de autenticación (token expirado)
      if (response.status === 401 && requiresAuth) {
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          // Reintentar con el nuevo token
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
          }
          
          return this.request<T>(endpoint, options);
        } else {
          // Si no se pudo renovar, cerrar sesión
          this.logout();
          throw new Error('Sesión expirada. Por favor, inicie sesión de nuevo.');
        }
      }
      
      // Manejar errores de respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }
      
      // Para respuestas vacías (como DELETE)
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parsear la respuesta a JSON
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error en petición API [${endpoint}]:`, error.message);
      } else {
        console.error(`Error desconocido en petición API [${endpoint}]`);
      }
      throw error;
    }
  }
  
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await fetch(`${API_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return true;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }
  
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Redirigir a la página de login
    window.location.href = '/login';
  }
  
  // Métodos para diferentes operaciones HTTP
  async get<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  async post<T>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    const body = options?.isFormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }
  
  async put<T>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    const body = options?.isFormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }
  
  async patch<T>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    const body = options?.isFormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
  
  async delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new ApiService();