import fs from 'fs';
import path from 'path';
import db from '../config/db';

// Función para limpiar imágenes huérfanas
export const cleanOrphanImages = async () => {
  try {
    console.log('Iniciando limpieza de imágenes huérfanas...');
    
    // Directorios a revisar
    const blogImageDir = path.join(__dirname, '../../uploads/images/blog');
    const contentImageDir = path.join(__dirname, '../../uploads/images/blog/content');
    
    // Verificar que los directorios existen
    if (!fs.existsSync(blogImageDir)) {
      console.log(`Directorio no encontrado: ${blogImageDir}, creando...`);
      fs.mkdirSync(blogImageDir, { recursive: true });
    }
    
    if (!fs.existsSync(contentImageDir)) {
      console.log(`Directorio no encontrado: ${contentImageDir}, creando...`);
      fs.mkdirSync(contentImageDir, { recursive: true });
    }
    
    // Obtener todas las imágenes utilizadas en la base de datos
    const [blogImagesResult] = await db.query(`
      SELECT image FROM blog_posts WHERE image IS NOT NULL AND image != ''
    `);
    
    const [contentImagesResult] = await db.query(`
      SELECT content FROM blog_posts WHERE content IS NOT NULL AND content LIKE '%<img%'
    `);
    
    // Extraer URLs de imágenes destacadas
    const usedBlogImages = new Set<string>();
    
    if (Array.isArray(blogImagesResult)) {
      blogImagesResult.forEach(row => {
        if (row.image && row.image !== '/images/blog/default-post.jpg') {
          usedBlogImages.add(path.basename(row.image));
        }
      });
    }
    
    // Extraer URLs de imágenes en el contenido
    const usedContentImages = new Set<string>();
    
    if (Array.isArray(contentImagesResult)) {
      contentImagesResult.forEach(row => {
        const content = row.content;
        if (!content) return;
        
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        
        while ((match = imgRegex.exec(content)) !== null) {
          const url = match[1];
          if (url.includes('/uploads/images/blog/content/')) {
            usedContentImages.add(path.basename(url));
          }
        }
      });
    }
    
    console.log(`Imágenes destacadas en uso: ${usedBlogImages.size}`);
    console.log(`Imágenes de contenido en uso: ${usedContentImages.size}`);
    
    // Eliminar imágenes no utilizadas (más antiguas de 24 horas)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let removedCount = 0;
    
    // Verificar imágenes destacadas
    if (fs.existsSync(blogImageDir)) {
      try {
        const blogImages = fs.readdirSync(blogImageDir);
        for (const image of blogImages) {
          if (image === '.gitkeep' || image === 'default-post.jpg' || image === 'content') continue;
          
          const imagePath = path.join(blogImageDir, image);
          
          // Verificar si es archivo
          if (!fs.statSync(imagePath).isFile()) continue;
          
          const stats = fs.statSync(imagePath);
          
          if (!usedBlogImages.has(image) && stats.mtimeMs < oneDayAgo) {
            try {
              fs.unlinkSync(imagePath);
              console.log(`Eliminada imagen destacada huérfana: ${image}`);
              removedCount++;
            } catch (err) {
              console.error(`Error al eliminar ${image}:`, err);
            }
          }
        }
      } catch (err) {
        console.error('Error al leer directorio de imágenes destacadas:', err);
      }
    }
    
    // Verificar imágenes de contenido
    if (fs.existsSync(contentImageDir)) {
      try {
        const contentImages = fs.readdirSync(contentImageDir);
        for (const image of contentImages) {
          if (image === '.gitkeep') continue;
          
          const imagePath = path.join(contentImageDir, image);
          
          // Verificar si es archivo
          if (!fs.statSync(imagePath).isFile()) continue;
          
          const stats = fs.statSync(imagePath);
          
          if (!usedContentImages.has(image) && stats.mtimeMs < oneDayAgo) {
            try {
              fs.unlinkSync(imagePath);
              console.log(`Eliminada imagen de contenido huérfana: ${image}`);
              removedCount++;
            } catch (err) {
              console.error(`Error al eliminar ${image}:`, err);
            }
          }
        }
      } catch (err) {
        console.error('Error al leer directorio de imágenes de contenido:', err);
      }
    }
    
    console.log(`Limpieza de imágenes completada. ${removedCount} imágenes eliminadas.`);
  } catch (error) {
    console.error('Error durante la limpieza de imágenes:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanOrphanImages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export default cleanOrphanImages;