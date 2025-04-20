/**
 * Función fetch personalizada que maneja el token CSRF
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Obtener el token CSRF de las cookies
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // Si es una petición que puede modificar datos
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || '')) {
    const csrftoken = getCookie('csrftoken');
    
    // Añadir el token a los headers
    options.headers = {
      ...options.headers,
      'X-CSRFToken': csrftoken || '',
    };
    
    // Asegurar que se envían las cookies
    options.credentials = 'include';
  }
  
  return fetch(url, options);
}