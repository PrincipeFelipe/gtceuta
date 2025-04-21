import { API_URL } from '../config/api';
import ApiService from './ApiService';

// Define las interfaces según la estructura exacta del backend
export interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  date: string;
  image?: string | File;
  image_url?: string;
  author?: number;
  author_name?: string;
  author_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  category?: string;
  tags?: string;
  published: boolean;
  featured?: boolean;
  meta_description?: string;
  last_modified?: string;
  content_images?: File[];
  images?: BlogImage[];
}

export interface BlogImage {
  id: number;
  post: number;
  image: string;
  url?: string;
  caption: string;
  order: number;
  is_content_image: boolean;
  created_at: string;
}

class BlogService {
  async getAllPosts(options?: { onlyPublished?: boolean }): Promise<BlogPost[]> {
    try {
      let url = `${API_URL}/api/posts/`;
      
      // Añadir parámetros de consulta
      if (options && options.onlyPublished) {
        url += '?published=true';
      }
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Verificar el formato de la respuesta y garantizar que se devuelve un array
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
        // Si la API devuelve un objeto con un campo 'results' que contiene el array
        return data.results;
      } else {
        console.error('Formato de respuesta inesperado:', data);
        return []; // Devolver array vacío en lugar de error para evitar crashes
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPostById(id: number): Promise<BlogPost> {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    try {
      const response = await fetch(`${API_URL}/api/posts/by_slug/?slug=${slug}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching post with slug ${slug}:`, error);
      throw error;
    }
  }

  async addPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    try {
      // Si hay un archivo de imagen o imágenes de contenido, usar FormData
      if (post.image instanceof File || (post.content_images && post.content_images.length > 0)) {
        const formData = new FormData();
        
        // Añadir todos los campos del post
        Object.entries(post).forEach(([key, value]) => {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else if (key === 'content_images' && Array.isArray(value)) {
            // Añadir cada imagen de contenido individualmente
            value.forEach(file => {
              if (file instanceof File) {
                formData.append(`content_images`, file);
              }
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        const response = await fetch(`${API_URL}/api/posts/`, {
          method: 'POST',
          headers: this.getAuthHeaders(true),
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || 
            `Error ${response.status}: ${response.statusText}`
          );
        }
        
        return await response.json();
      } else {
        // Si no hay archivos, usar JSON normal
        const response = await fetch(`${API_URL}/api/posts/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify(post),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || 
            `Error ${response.status}: ${response.statusText}`
          );
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(post: BlogPost): Promise<BlogPost> {
    try {
      if (!post.id) {
        throw new Error('Post ID is required for update');
      }
      
      // Si hay un archivo de imagen o imágenes de contenido, usar FormData
      if (post.image instanceof File || (post.content_images && post.content_images.length > 0)) {
        const formData = new FormData();
        
        // Añadir todos los campos del post
        Object.entries(post).forEach(([key, value]) => {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else if (key === 'content_images' && Array.isArray(value)) {
            value.forEach(file => {
              if (file instanceof File) {
                formData.append(`content_images`, file);
              }
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        const response = await fetch(`${API_URL}/api/posts/${post.id}/`, {
          method: 'PATCH',
          headers: this.getAuthHeaders(true),
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || 
            `Error ${response.status}: ${response.statusText}`
          );
        }
        
        return await response.json();
      } else {
        // Si no hay archivos, usar JSON normal
        const response = await fetch(`${API_URL}/api/posts/${post.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify(post),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || 
            `Error ${response.status}: ${response.statusText}`
          );
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error(`Error updating post ${post.id}:`, error);
      throw error;
    }
  }

  async deletePost(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  }

  async uploadContentImage(postId: number | null, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      if (postId) {
        formData.append('post_id', String(postId));
      }
      
      formData.append('type', 'content');
      
      const response = await fetch(`${API_URL}/api/upload-image/`, {
        method: 'POST',
        headers: this.getAuthHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading content image:', error);
      throw error;
    }
  }

  async uploadPostMainImage(file: File, postId?: number): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'main');
      
      if (postId) {
        formData.append('post_id', String(postId));
      }
      
      const response = await fetch(`${API_URL}/api/upload-image/`, {
        method: 'POST',
        headers: this.getAuthHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading main image:', error);
      throw error;
    }
  }

  async getPostImages(postId: number): Promise<BlogImage[]> {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/images/`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching post images for post ${postId}:`, error);
      throw error;
    }
  }
  
  async exportPosts(): Promise<BlogPost[]> {
    try {
      const posts = await this.getAllPosts();
      return posts;
    } catch (error) {
      console.error('Error exporting posts:', error);
      throw error;
    }
  }
  
  async importPosts(posts: BlogPost[]): Promise<void> {
    try {
      for (const post of posts) {
        if (post.id) {
          await this.updatePost(post);
        } else {
          await this.addPost(post);
        }
      }
    } catch (error) {
      console.error('Error importing posts:', error);
      throw error;
    }
  }
  
  async getRecentPosts(limit: number): Promise<BlogPost[]> {
    try {
      const posts = await this.getAllPosts();
      return posts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, limit);
    } catch (error) {
      console.error('Error getting recent posts:', error);
      throw error;
    }
  }
  
  async countPostsByCategory(): Promise<Record<string, number>> {
    try {
      const posts = await this.getAllPosts();
      const categories: Record<string, number> = {};
      
      posts.forEach(post => {
        const category = post.category || 'sin-categoria';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      return categories;
    } catch (error) {
      console.error('Error counting posts by category:', error);
      throw error;
    }
  }

  // Utilidad para obtener headers de autenticación
  private getAuthHeaders(isFormData = false): HeadersInit {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Implementación específica para el dashboard que devuelve siempre un array
  async getDashboardPosts(): Promise<BlogPost[]> {
    try {
      const posts = await this.getAllPosts();
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error('Error fetching dashboard posts:', error);
      return []; // Siempre devolver array
    }
  }
}

export default new BlogService();