import React, { useEffect, useRef } from 'react';
import { normalizeImageUrl } from '../../utils/imageUtils';
import '../../styles/blog-content.css';

interface BlogContentProps {
  content: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Procesar las imágenes después de que el componente se renderice
  useEffect(() => {
    if (contentRef.current) {
      // Encontrar todas las imágenes y normalizar sus URLs
      const images = contentRef.current.querySelectorAll('img');
      console.log(`Procesando ${images.length} imágenes en el contenido del blog`);
      
      images.forEach((img, index) => {
        const originalSrc = img.getAttribute('src');
        if (originalSrc) {
          const normalizedSrc = normalizeImageUrl(originalSrc);
          console.log(`Imagen ${index + 1}: ${originalSrc.substring(0, 30)}... → ${normalizedSrc.substring(0, 30)}...`);
          img.setAttribute('src', normalizedSrc);
          
          // Añadir clase para estilizar correctamente
          img.classList.add('blog-content-image');
          
          // Añadir manejador de errores
          img.onerror = () => {
            console.error(`Error al cargar la imagen ${index + 1}: ${normalizedSrc}`);
            img.src = '/images/placeholder.png';
          };
        }
      });
    }
  }, [content]);
  
  return (
    <div 
      ref={contentRef}
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default BlogContent;