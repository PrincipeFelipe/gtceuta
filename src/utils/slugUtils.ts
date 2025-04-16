/**
 * Verifica si un slug es válido.
 * Un slug válido debe contener solo letras minúsculas, números y guiones.
 * 
 * @param slug El slug a verificar
 * @returns Verdadero si el slug es válido
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  
  // Comprobar que solo contiene caracteres permitidos 
  // (letras minúsculas, números y guiones)
  const validChars = /^[a-z0-9-]+$/;
  if (!validChars.test(slug)) return false;
  
  // Comprobar que no tiene guiones consecutivos
  if (slug.includes('--')) return false;
  
  // Comprobar que no empieza ni termina con guión
  if (slug.startsWith('-') || slug.endsWith('-')) return false;
  
  return true;
}

/**
 * Convierte un texto en un slug válido.
 * 
 * @param text El texto a convertir en slug
 * @returns Un slug válido generado a partir del texto
 */
export function createSlug(text: string): string {
  if (!text) return '';
  
  return text
    // Convertir a minúsculas
    .toLowerCase()
    // Reemplazar acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios, puntos y otros caracteres con guiones
    .replace(/[^a-z0-9]+/g, '-')
    // Eliminar guiones consecutivos
    .replace(/-+/g, '-')
    // Eliminar guiones al inicio y al final
    .replace(/^-|-$/g, '');
}

/**
 * Genera un slug único añadiendo un sufijo numérico si es necesario
 * 
 * @param baseSlug El slug base
 * @param existingSlugs Lista de slugs existentes
 * @returns Un slug único
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) return baseSlug;
  
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}

/**
 * Sanitiza un slug para asegurar que cumple con los requisitos
 * 
 * @param slug El slug a sanitizar
 * @returns El slug sanitizado
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return '';
  
  // Si ya es un slug válido, devolverlo
  if (isValidSlug(slug)) return slug;
  
  // Si no es válido, crear uno nuevo
  return createSlug(slug);
}