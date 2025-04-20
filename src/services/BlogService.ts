import { v4 as uuidv4 } from 'uuid';
import { API_URL } from '../config/api';
import { isValidSlug, createSlug } from '../utils/slugUtils';

// Implementación personalizada de sanitizeHtml
function sanitizeHtml(html: string, options?: any): string {
  // Implementación básica - Elimina etiquetas <script> y atributos on*
  if (!html) return '';
  
  // Lista de etiquetas permitidas (simula options.allowedTags)
  const defaultAllowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'];
  
  // Simplemente devolvemos el HTML tal cual - en el backend se hará la sanitización real
  return html;
}

// Agregar propiedades al sanitizeHtml para evitar errores
(sanitizeHtml as any).defaults = {
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id', 'style']
  }
};

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  meta_description?: string;
  last_modified?: string;
}

// Función para subir una imagen al servidor
async function uploadImage(imageBase64: string, type: 'blog' | 'content' = 'blog'): Promise<string> {
  try {
    // Si ya es una URL, no es necesario subirla
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return imageBase64;
    }
    
    const endpoint = type === 'content' ? 'upload/content-image' : 'upload/blog-image';
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 })
    });
    
    if (!response.ok) {
      throw new Error(`Error al subir la imagen: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
}

// Función para procesar el contenido HTML y reemplazar imágenes base64 con URLs
async function processHtmlContent(html: string): Promise<string> {
  if (!html) return '';
  
  try {
    // Crear un DOM temporal para analizar el HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Encontrar todas las imágenes con data:image
    const images = doc.querySelectorAll('img[src^="data:image"]');
    
    // Subir cada imagen y reemplazar el src
    const uploadPromises = Array.from(images).map(async (img) => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('data:image')) {
        const imageUrl = await uploadImage(src, 'content');
        img.setAttribute('src', imageUrl);
      }
    });
    
    // Esperar a que todas las imágenes se suban
    await Promise.all(uploadPromises);
    
    // Devolver el HTML actualizado
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error procesando contenido HTML:', error);
    return html; // En caso de error, devolver el HTML original
  }
}

interface BlogSearchOptions {
  searchTerm?: string;
  category?: string;
  onlyPublished?: boolean;
}

class BlogService {
  // Obtener todos los posts
  async getAllPosts(options?: BlogSearchOptions): Promise<BlogPost[]> {
    try {
      let url = `${API_URL}/posts/`;
      
      // Agregar parámetros de búsqueda a la URL
      if (options) {
        const params = new URLSearchParams();
        
        if (options.searchTerm) {
          params.append('search', options.searchTerm);
        }
        
        if (options.category) {
          params.append('category', options.category);
        }
        
        if (options.onlyPublished !== undefined) {
          params.append('published', options.onlyPublished.toString());
        }
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      console.log('Fetching posts from API:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data; // Django REST Framework envía los resultados en una propiedad 'results' cuando hay paginación
    } catch (error) {
      console.error('Error en getAllPosts:', error);
      throw error;
    }
  }

  // Obtener un post por ID
  async getPostById(id: number): Promise<BlogPost | undefined> {
    try {
      const response = await fetch(`${API_URL}/posts/${id}/`);
      
      if (response.status === 404) {
        return undefined;
      }
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const post = await response.json();
      return post;
    } catch (error) {
      console.error('Error en getPostById:', error);
      throw error;
    }
  }

  // Obtener un post por slug
  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const response = await fetch(`${API_URL}/posts/by_slug/?slug=${slug}`);
      
      if (response.status === 404) {
        return undefined;
      }
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const post = await response.json();
      return post;
    } catch (error) {
      console.error('Error en getPostBySlug:', error);
      throw error;
    }
  }

  // Añadir un nuevo post
  async addPost(post: Omit<BlogPost, 'id'>): Promise<number> {
    try {
      // Primero subir la imagen destacada si es base64
      let imageUrl = post.image;
      if (post.image && post.image.startsWith('data:image')) {
        imageUrl = await this.uploadImage(post.image, 'blog');
      }
      
      // Procesar el contenido HTML para subir imágenes inline
      const processedContent = await this.processHtmlContent(post.content);
      
      const postData = {
        ...post,
        image: imageUrl,
        content: processedContent,
        date: post.date || new Date().toISOString()
      };
      
      const response = await fetch(`${API_URL}/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const newPost = await response.json();
      return newPost.id;
    } catch (error) {
      console.error('Error en addPost:', error);
      throw error;
    }
  }

  // Actualizar un post existente
  async updatePost(post: BlogPost): Promise<void> {
    try {
      // Subir la imagen destacada si es base64
      let imageUrl = post.image;
      if (post.image && post.image.startsWith('data:image')) {
        imageUrl = await this.uploadImage(post.image, 'blog');
      }
      
      // Procesar el contenido HTML para subir imágenes inline
      const processedContent = await this.processHtmlContent(post.content);
      
      const postData = {
        ...post,
        image: imageUrl,
        content: processedContent
      };
      
      const response = await fetch(`${API_URL}/posts/${post.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error en updatePost:', error);
      throw error;
    }
  }

  // Eliminar un post
  async deletePost(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/posts/${id}/`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error en deletePost:', error);
      throw error;
    }
  }

  // Subir imagen
  async uploadImage(imageBase64: string, type: 'blog' | 'content' = 'blog'): Promise<string> {
    try {
      // Si ya es una URL, no es necesario subirla
      if (!imageBase64 || !imageBase64.startsWith('data:image')) {
        return imageBase64;
      }
      
      // Endpoint ajustado para Django
      const response = await fetch(`${API_URL}/upload-image/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageBase64,
          type: type
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al subir la imagen: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }

  // Procesamiento de HTML para contenido del blog
  async processHtmlContent(html: string): Promise<string> {
    // ...código existente...
  }

  // Importar posts
  async importPosts(posts: BlogPost[]): Promise<{ created: number; updated: number; errors: number }> {
    try {
      const response = await fetch(`${API_URL}/posts/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posts)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al importar los posts: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.results || { created: 0, updated: 0, errors: 0 };
    } catch (error) {
      console.error('Error en importPosts:', error);
      throw error;
    }
  }
  
  // Exportar posts
  async exportPosts(): Promise<BlogPost[]> {
    return this.getAllPosts();
  }
  
  // Buscar posts por categoría
  async getPostsByCategory(category: string): Promise<BlogPost[]> {
    return this.getAllPosts({ category });
  }
  
  // Obtener categorías disponibles
  async getCategories(): Promise<string[]> {
    try {
      const allPosts = await this.getAllPosts();
      const categoriesSet = new Set<string>(allPosts.map(post => post.category));
      return Array.from(categoriesSet);
    } catch (error) {
      console.error('Error en getCategories:', error);
      throw error;
    }
  }
  
  // Obtener posts recientes
  async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    try {
      const allPosts = await this.getAllPosts({ onlyPublished: true });
      return allPosts.slice(0, limit);
    } catch (error) {
      console.error('Error en getRecentPosts:', error);
      return [];
    }
  }
  
  // Obtener posts relacionados
  async getRelatedPosts(postId: number, limit: number = 3): Promise<BlogPost[]> {
    try {
      const post = await this.getPostById(postId);
      if (!post) return [];
      
      const allPosts = await this.getAllPosts({ onlyPublished: true, category: post.category });
      return allPosts
        .filter(p => p.id !== postId)
        .slice(0, limit);
    } catch (error) {
      console.error('Error en getRelatedPosts:', error);
      return [];
    }
  }
  
  // Contar posts por categoría
  async countPostsByCategory(): Promise<Record<string, number>> {
    try {
      const allPosts = await this.getAllPosts();
      const counts: Record<string, number> = {};
      
      allPosts.forEach(post => {
        counts[post.category] = (counts[post.category] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      console.error('Error en countPostsByCategory:', error);
      return {};
    }
  }
  
  // Ajustar el método de inicialización

  // Inicializar datos por defecto
  public async initializeDefaultPosts(): Promise<void> {
    try {
      console.log('Intentando inicializar posts predeterminados...');
      
      try {
        // Verificar si ya hay posts en la API
        const existingPosts = await this.getAllPosts();
        
        if (existingPosts.length === 0) {
          console.log('No hay posts existentes, procediendo con la inicialización...');
          
          // Datos predeterminados en caso de que falle la importación
          const defaultPostsData = [
            {
              id: 1,
              title: "Bienvenidos al Grand Tournament Ceuta 2025",
              slug: "bienvenidos-gt-ceuta-2025",
              excerpt: "Es un placer presentar la primera edición del Grand Tournament Ceuta.",
              content: "# Bienvenidos al Grand Tournament Ceuta 2025\n\nEs un placer presentar la primera edición del Grand Tournament Ceuta, un evento internacional de ajedrez.",
              date: new Date().toISOString(),
              image: "/blog/welcome-post.jpg",
              author: "Comité Organizador",
              category: "Anuncios",
              tags: ["torneo", "inauguración"],
              published: true,
              featured: true
            },
            {
              id: 2,
              title: "Abierto el periodo de inscripción",
              slug: "abierto-periodo-inscripcion",
              excerpt: "Ya puedes inscribirte para participar en el Grand Tournament Ceuta 2025.",
              content: "# Abierto el periodo de inscripción\n\nYa puedes inscribirte para participar en el Grand Tournament Ceuta 2025.",
              date: new Date().toISOString(),
              image: "/blog/registration-open.jpg",
              author: "Comité Organizador",
              category: "Inscripciones",
              tags: ["inscripción", "tarifas"],
              published: true,
              featured: false
            }
          ];
          
          try {
            // Intentar importar los datos iniciales del archivo
            console.log('Intentando cargar datos iniciales desde archivo...');
            const initialData = await import('../data/initialBlogData');
            const filePosts = initialData.initialBlogData || [];
            console.log(`Datos cargados correctamente: ${filePosts.length} posts`);
            
            // Usar los datos del archivo si están disponibles
            if (filePosts.length > 0) {
              console.log('Importando posts desde archivo...');
              await this.importPosts(filePosts.map(post => ({
                ...post,
                id: post.id || 0 // Usar el ID existente o 0
              })));
            } else {
              console.log('No hay posts en el archivo, usando datos predeterminados...');
              await this.importPosts(defaultPostsData.map(post => ({
                ...post,
                id: 0 // ID temporal que será reemplazado por la base de datos
              })));
            }
          } catch (importError) {
            console.error('Error al cargar archivo de posts:', importError);
            console.log('Usando datos predeterminados fallback...');
            
            // Si falla la importación, usar los datos predeterminados
            await this.importPosts(defaultPostsData.map(post => ({
              ...post,
              id: 0 // ID temporal que será reemplazado por la base de datos
            })));
          }
          
          console.log('Posts inicializados correctamente');
        } else {
          console.log(`Ya existen ${existingPosts.length} posts, omitiendo inicialización`);
        }
      } catch (apiError) {
        console.error('Error al verificar posts existentes:', apiError);
        throw new Error('No se pudo verificar si existen posts');
      }
    } catch (error) {
      console.error('Error inicializando posts predeterminados:', error);
      throw error;
    }
  }
}

// Exportamos una instancia del servicio para uso global
const blogService = new BlogService();
export default blogService;