import { Request, Response } from 'express';
import pool from '../config/db';

// Obtener todos los posts
export async function getAllPosts(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_posts ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ error: 'Error al obtener los posts' });
  }
}

// Obtener un post por ID
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Post no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ error: 'Error al obtener el post' });
  }
}

// Obtener post por slug
export async function getPostBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE slug = ?', [slug]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Post no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener post por slug:', error);
    res.status(500).json({ error: 'Error al obtener el post' });
  }
}

// Crear un nuevo post
export async function createPost(req: Request, res: Response) {
  try {
    const { title, slug, excerpt, content, image, author, category, tags, published, featured, meta_description } = req.body;
    
    // Validar datos necesarios
    if (!title || !content || !slug) {
      return res.status(400).json({ error: 'Se requiere título, slug y contenido' });
    }

    // Asegurar que tags es un array o un objeto JSON válido
    let tagsJson = '[]';
    if (tags) {
      if (Array.isArray(tags)) {
        tagsJson = JSON.stringify(tags);
      } else if (typeof tags === 'string') {
        // Intenta parsear si es un string que representa un JSON
        try {
          JSON.parse(tags);
          tagsJson = tags;
        } catch {
          tagsJson = JSON.stringify([tags]);
        }
      } else {
        tagsJson = JSON.stringify([]);
      }
    }

    // Verificar si el slug ya existe
    const [existingPosts] = await pool.query('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
    if (Array.isArray(existingPosts) && existingPosts.length > 0) {
      return res.status(400).json({ error: 'Ya existe un post con ese slug' });
    }
    
    // Insertar en la base de datos
    const [result] = await pool.query(
      'INSERT INTO blog_posts (title, slug, excerpt, content, image, author, category, tags, published, featured, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, excerpt || '', content, image || '', author || '', category || '', tagsJson, published || false, featured || false, meta_description || '']
    );
    
    const newPost = {
      id: (result as any).insertId,
      title,
      slug,
      excerpt,
      content,
      date: new Date(),
      image,
      author,
      category,
      tags: Array.isArray(tags) ? tags : [],
      published,
      featured,
      meta_description
    };
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ error: 'Error al crear el post' });
  }
}

// Actualizar la función updatePost

export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, image, author, category, tags, published, featured, meta_description } = req.body;
    
    // Validar datos necesarios
    if (!title || !content || !slug) {
      return res.status(400).json({ error: 'Se requiere título, slug y contenido' });
    }
    
    // Verificar si el post existe
    const [existingPost] = await pool.query('SELECT id FROM blog_posts WHERE id = ?', [id]);
    if (Array.isArray(existingPost) && existingPost.length === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    
    // Verificar si el slug ya está en uso por otro post
    const [existingSlug] = await pool.query('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, id]);
    if (Array.isArray(existingSlug) && existingSlug.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro post con ese slug' });
    }
    
    // Actualizar en la base de datos
    await pool.query(
      'UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, author = ?, category = ?, tags = ?, published = ?, featured = ?, meta_description = ? WHERE id = ?',
      [title, slug, excerpt || '', content, image || '', author || '', category || '', JSON.stringify(tags || []), published || false, featured || false, meta_description || '', id]
    );
    
    res.json({ id, message: 'Post actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar post:', error);
    res.status(500).json({ error: 'Error al actualizar el post' });
  }
}

// Eliminar un post
export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar si el post existe
    const [existingPost] = await pool.query('SELECT id FROM blog_posts WHERE id = ?', [id]);
    if (Array.isArray(existingPost) && existingPost.length === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    
    // Eliminar de la base de datos
    await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    
    res.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({ error: 'Error al eliminar el post' });
  }
}

// Importar múltiples posts
export async function importPosts(req: Request, res: Response) {
  try {
    const posts = req.body;
    
    if (!Array.isArray(posts)) {
      return res.status(400).json({ error: 'El formato de los datos es incorrecto' });
    }
    
    const results = {
      created: 0,
      updated: 0,
      errors: 0
    };
    
    for (const post of posts) {
      try {
        // Si tiene ID, actualizar
        if (post.id) {
          const [existingPost] = await pool.query('SELECT id FROM blog_posts WHERE id = ?', [post.id]);
          
          if (Array.isArray(existingPost) && existingPost.length > 0) {
            // Actualizar post existente
            await pool.query(
              'UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, author = ?, category = ?, tags = ?, published = ?, featured = ?, meta_description = ? WHERE id = ?',
              [post.title, post.slug, post.excerpt || '', post.content, post.image || '', post.author || '', post.category || '', JSON.stringify(post.tags || []), post.published || false, post.featured || false, post.meta_description || '', post.id]
            );
            results.updated++;
          } else {
            // Crear nuevo post con ID especificado
            await pool.query(
              'INSERT INTO blog_posts (id, title, slug, excerpt, content, image, author, category, tags, published, featured, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [post.id, post.title, post.slug, post.excerpt || '', post.content, post.image || '', post.author || '', post.category || '', JSON.stringify(post.tags || []), post.published || false, post.featured || false, post.meta_description || '']
            );
            results.created++;
          }
        } else {
          // Crear nuevo post con ID automático
          await pool.query(
            'INSERT INTO blog_posts (title, slug, excerpt, content, image, author, category, tags, published, featured, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [post.title, post.slug, post.excerpt || '', post.content, post.image || '', post.author || '', post.category || '', JSON.stringify(post.tags || []), post.published || false, post.featured || false, post.meta_description || '']
          );
          results.created++;
        }
      } catch (error) {
        console.error('Error al importar post:', error);
        results.errors++;
      }
    }
    
    res.json({
      message: `Importación completada: ${results.created} creados, ${results.updated} actualizados, ${results.errors} errores`,
      results
    });
  } catch (error) {
    console.error('Error al importar posts:', error);
    res.status(500).json({ error: 'Error al importar posts' });
  }
}

// Exportar todos los posts
export async function exportPosts(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_posts');
    res.json(rows);
  } catch (error) {
    console.error('Error al exportar posts:', error);
    res.status(500).json({ error: 'Error al exportar posts' });
  }
}