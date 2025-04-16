/**
 * Normaliza una URL de imagen para asegurar que sea una URL completa
 * @param imageUrl URL de la imagen a normalizar
 * @returns URL normalizada
 */
export const normalizeImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '/images/fallback-image.png';
  
  // Si ya es una URL completa (http:// o https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si es una URL relativa que empieza con /uploads/
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:4000${imageUrl}`;
  }
  
  // Si es una URL relativa que no empieza con /
  if (!imageUrl.startsWith('/')) {
    return `/${imageUrl}`;
  }
  
  return imageUrl;
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