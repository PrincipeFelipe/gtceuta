/**
 * Configuración de la API
 * Centraliza la URL base para facilitar cambios entre entornos
 */

// URL base para la API según el entorno
// Asegúrate de que este valor NO termina con /api si usas '/api' en tus rutas
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Otras configuraciones relacionadas con la API
export const API_TIMEOUT = 30000; // 30 segundos
export const MAX_RETRIES = 3;