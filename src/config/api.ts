/**
 * Configuración de la API
 * Centraliza la URL base para facilitar cambios entre entornos
 */

// URL base para la API según el entorno
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Otras configuraciones relacionadas con la API
export const API_TIMEOUT = 30000; // 30 segundos
export const MAX_RETRIES = 3;