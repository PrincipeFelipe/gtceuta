/**
 * Configuración de la API
 * Centraliza la URL base para facilitar cambios entre entornos
 */

// URL base para la API según el entorno
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Verificar si la URL termina con /api para evitar duplicados
export function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith('/api/') && API_URL.endsWith('/api')) {
    return `${API_URL}${endpoint.substring(4)}`;
  }
  
  if (endpoint.startsWith('/')) {
    return `${API_URL}${endpoint}`;
  }
  
  return `${API_URL}/${endpoint}`;
}

// Otras configuraciones relacionadas con la API
export const API_TIMEOUT = 30000; // 30 segundos
export const MAX_RETRIES = 3;