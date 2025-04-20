export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  author?: number;  // ID del autor en Django
  author_name?: string; // Nombre completo del autor, proporcionado por Django
  author_details?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  meta_description?: string;
  last_modified?: string;
  images?: BlogImage[];  // Imágenes adicionales
}

export interface BlogImage {
  id: number;
  image: string;
  caption: string | null;
  order: number;
  created_at: string;
}