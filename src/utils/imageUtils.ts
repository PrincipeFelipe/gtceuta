import { API_URL } from '../config/api';

/**
 * Normaliza una URL de imagen para asegurar que sea accesible
 */
export const normalizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si es una imagen por defecto, devolverla tal cual
  if (url === '/images/blog/default-post.jpg') {
    return url;
  }
  
  // Si ya es una URL absoluta
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Corregir URLs de localhost si estamos en otro origen
    if (url.includes('localhost:4000') && 
        window.location.hostname === 'localhost' && 
        window.location.port !== '4000') {
      return url.replace('http://localhost:4000', window.location.origin);
    }
    return url;
  }
  
  // Para URLs que comienzan con /uploads
  if (url.startsWith('/uploads')) {
    // En desarrollo, usar API_URL
    if (window.location.hostname === 'localhost') {
      return `${API_URL}${url}`;
    }
    // En producción, usarla tal cual
    return url;
  }
  
  // Para cualquier otro caso, devolver la URL tal cual
  return url;
};

/**
 * Verifica si una URL es válida
 * @param url URL a verificar
 * @returns true si es una URL válida
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  
  // Comprobar si es una URL http/https o una ruta de archivo válida
  return (
    url.startsWith('http://') || 
    url.startsWith('https://') ||
    url.startsWith('/uploads/') ||
    url.startsWith('/images/')
  );
};