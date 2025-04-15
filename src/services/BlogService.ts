import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Definimos la estructura de la base de datos
interface BlogPostDB extends DBSchema {
  'blog-posts': {
    key: number;
    value: BlogPost;
    indexes: { 'by-slug': string };
  };
}

// Modelo de Post del Blog
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  published: boolean;
  authorId?: number;
}

// Nombre de la base de datos
const DB_NAME = 'gt-ceuta-blog-db';
const STORE_NAME = 'blog-posts';
const DB_VERSION = 1;

// Clase que maneja las operaciones de la base de datos
class BlogService {
  private db: Promise<IDBPDatabase<BlogPostDB>>;

  constructor() {
    this.db = this.initDB();
  }

  // Inicializa la base de datos
  private async initDB(): Promise<IDBPDatabase<BlogPostDB>> {
    return openDB<BlogPostDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Crear el almacén de objetos si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          // Crear índice para búsquedas por slug
          store.createIndex('by-slug', 'slug', { unique: true });
        }
      },
    });
  }

  // CRUD OPERATIONS

  // Create: Añadir un nuevo post
  async addPost(post: Omit<BlogPost, 'id'>): Promise<number> {
    const db = await this.db;
    
    // Verificar que el slug no existe ya
    try {
      const existingPost = await this.getPostBySlug(post.slug);
      if (existingPost) {
        throw new Error(`Ya existe un post con el slug "${post.slug}"`);
      }
    } catch (err) {
      // Si el error es porque no existe, está bien, continuamos
      if (!(err instanceof Error) || !err.message.includes('no encontrado')) {
        throw err;
      }
    }
    
    return db.add(STORE_NAME, post as BlogPost);
  }

  // Read: Obtener todos los posts (con filtro opcional)
  async getAllPosts(options?: { 
    searchTerm?: string; 
    category?: string;
    onlyPublished?: boolean;
  }): Promise<BlogPost[]> {
    const db = await this.db;
    const posts = await db.getAll(STORE_NAME);
    
    // Ordenar posts por fecha (del más reciente al más antiguo)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Filtrar los resultados si se especifican opciones
    return posts.filter(post => {
      // Filtro por término de búsqueda
      const matchesSearch = !options?.searchTerm || 
        post.title.toLowerCase().includes(options.searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(options.searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(options.searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchesCategory = !options?.category || options.category === 'todos' || 
        post.category === options.category;
      
      // Filtro por estado de publicación
      const matchesPublished = !options?.onlyPublished || post.published;
      
      return matchesSearch && matchesCategory && matchesPublished;
    });
  }

  // Read: Obtener un post por su ID
  async getPostById(id: number): Promise<BlogPost | undefined> {
    const db = await this.db;
    return db.get(STORE_NAME, id);
  }

  // Read: Obtener un post por su slug
  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const db = await this.db;
    return db.getFromIndex(STORE_NAME, 'by-slug', slug);
  }

  // Update: Actualizar un post existente
  async updatePost(post: BlogPost): Promise<void> {
    const db = await this.db;
    
    // Verificar que el post existe antes de actualizar
    const existingPost = await db.get(STORE_NAME, post.id);
    if (!existingPost) {
      throw new Error(`Post con ID ${post.id} no encontrado`);
    }
    
    // Si el slug cambió, verificar que no existe ya
    if (post.slug !== existingPost.slug) {
      try {
        const postWithSameSlug = await this.getPostBySlug(post.slug);
        if (postWithSameSlug && postWithSameSlug.id !== post.id) {
          throw new Error(`Ya existe otro post con el slug "${post.slug}"`);
        }
      } catch (err) {
        // Si el error es porque no existe, está bien, continuamos
        if (!(err instanceof Error) || !err.message.includes('no encontrado')) {
          throw err;
        }
      }
    }
    
    await db.put(STORE_NAME, post);
  }

  // Delete: Eliminar un post
  async deletePost(id: number): Promise<void> {
    const db = await this.db;
    await db.delete(STORE_NAME, id);
  }

  // Método para importar datos iniciales (útil para la carga inicial)
  async importPosts(posts: Omit<BlogPost, 'id'>[]): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    
    // Verificar si ya hay datos en la base
    const count = await tx.store.count();
    if (count === 0) {
      // Solo importar si no hay datos
      for (const post of posts) {
        await tx.store.add(post as BlogPost);
      }
    }
    
    await tx.done;
  }

  // Método para exportar todos los posts (útil para backups)
  async exportPosts(): Promise<BlogPost[]> {
    return this.getAllPosts();
  }

  // Método para buscar posts por categoría
  async getPostsByCategory(category: string): Promise<BlogPost[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter(post => post.category === category);
  }

  // Método para obtener las categorías únicas presentes en los posts
  async getCategories(): Promise<string[]> {
    const allPosts = await this.getAllPosts();
    const categoriesSet = new Set<string>(allPosts.map(post => post.category));
    return Array.from(categoriesSet);
  }

  // Método para obtener los posts más recientes
  async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    const allPosts = await this.getAllPosts({ onlyPublished: true });
    return allPosts.slice(0, limit);
  }

  // Método para buscar posts relacionados (por categoría)
  async getRelatedPosts(postId: number, limit: number = 3): Promise<BlogPost[]> {
    const post = await this.getPostById(postId);
    if (!post) return [];

    const allPosts = await this.getAllPosts({ onlyPublished: true });
    return allPosts
      .filter(p => p.id !== postId && p.category === post.category)
      .slice(0, limit);
  }

  // Método para contar posts por categoría
  async countPostsByCategory(): Promise<Record<string, number>> {
    const allPosts = await this.getAllPosts();
    const counts: Record<string, number> = {};
    
    allPosts.forEach(post => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    
    return counts;
  }

  // Añadir el método que falta:

  // Agregar al final de la clase o reemplazar si ya existe
  public async initializeDefaultPosts(): Promise<void> {
    try {
      const posts = await this.getAllPosts();
      
      if (posts.length === 0) {
        console.log('Inicializando posts predeterminados...');
        
        // Importar los datos iniciales desde initialBlogData.ts
        const initialBlogData = await import('../data/initialBlogData');
        const defaultPosts = initialBlogData.initialBlogData || [];
        
        // Añadir cada post a la base de datos
        for (const post of defaultPosts) {
          await this.addPost({
            ...post,
            published: true
          });
        }
        
        console.log('Posts inicializados correctamente');
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