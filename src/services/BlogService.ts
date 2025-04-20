import ApiService from './ApiService';
import { API_URL } from '../config/api';

export interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string | File;
  date: string;
  author?: number;
  author_name?: string;
  category?: string;
  published: boolean;
  featured?: boolean;
  // Otros campos del blog post
}

class BlogService {
  async getAllPosts(): Promise<BlogPost[]> {
    return ApiService.get('/api/blog/posts/');
  }

  async getPostById(id: number): Promise<BlogPost> {
    return ApiService.get(`/api/blog/posts/${id}/`);
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    return ApiService.get(`/api/blog/posts/by_slug/?slug=${slug}`);
  }

  async addPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    // Si post.image es un File, necesitamos usar FormData
    if (post.image instanceof File) {
      const formData = new FormData();
      
      // Añadir todos los campos del post al FormData
      Object.entries(post).forEach(([key, value]) => {
        if (key === 'image') {
          formData.append(key, value as File);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      return ApiService.post('/api/blog/posts/', formData, { isFormData: true });
    }
    
    // Si no hay imagen o es una string (URL), usar JSON
    return ApiService.post('/api/blog/posts/', post);
  }

  async updatePost(post: BlogPost): Promise<BlogPost> {
    // Similar al addPost, manejar FormData si hay File
    if (post.image instanceof File) {
      const formData = new FormData();
      
      Object.entries(post).forEach(([key, value]) => {
        if (key === 'image') {
          formData.append(key, value as File);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      return ApiService.put(`/api/blog/posts/${post.id}/`, formData, { isFormData: true });
    }
    
    return ApiService.put(`/api/blog/posts/${post.id}/`, post);
  }

  async deletePost(id: number): Promise<void> {
    return ApiService.delete(`/api/blog/posts/${id}/`);
  }

  // Método para subir imágenes de contenido
  async uploadContentImage(postId: number, image: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('is_content_image', 'true');
    
    return ApiService.post(`/api/blog/posts/${postId}/upload_images/`, formData, { isFormData: true });
  }

  async exportPosts(): Promise<BlogPost[]> {
    return ApiService.get('/api/blog/posts/export_posts/');
  }
}

export default new BlogService();