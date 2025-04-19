import React, { useEffect, useRef } from 'react';
import { API_URL } from '../../config/api';
import SmartImage from '../ui/SmartImage';

interface BlogContentProps {
  content: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Procesar todas las imágenes en el contenido para asegurarnos de que las URLs son absolutas
      const images = contentRef.current.querySelectorAll('img');
      
      images.forEach((img, index) => {
        const src = img.getAttribute('src');
        if (!src) return;
        
        console.log(`Procesando imagen ${index + 1} del contenido:`, src);
        
        // Reemplazar la imagen original con SmartImage
        const smartImg = document.createElement('img');
        
        // Copiar atributos originales
        Array.from(img.attributes).forEach(attr => {
          if (attr.name !== 'src') {
            smartImg.setAttribute(attr.name, attr.value);
          }
        });
        
        // Asegurar que la clase necesaria está presente
        smartImg.classList.add('content-image');
        
        // Configurar evento onerror para manejar errores de carga
        smartImg.onerror = function() {
          console.error(`Error al cargar la imagen ${index + 1}:`, src);
          
          // Intentar cargar con URL absoluta usando API_URL
          if (src.startsWith('/uploads')) {
            const absoluteSrc = `${API_URL}${src}`;
            console.log(`Intentando con URL absoluta: ${absoluteSrc}`);
            
            // Actualizar directamente el src en lugar de crear un nuevo elemento
            this.setAttribute('src', absoluteSrc);
            
            // Si aún así falla, configurar un segundo onerror
            this.onerror = function() {
              console.error(`Error persistente con la imagen. Usando URL original:`, src);
              // Intentar una última versión con window.location.origin
              this.setAttribute('src', `${window.location.origin}${src}`);
              
              // Si también falla, usar imagen de respaldo
              this.onerror = function() {
                console.error(`No se pudo cargar la imagen. Usando imagen de respaldo`);
                this.setAttribute('src', '/images/blog/default-post.jpg');
              };
            };
          } else {
            // Si no es una URL que comienza con /uploads, mostrar imagen de respaldo
            this.setAttribute('src', '/images/blog/default-post.jpg');
          }
        };
        
        // Configurar src después de configurar onerror
        if (src.startsWith('/uploads')) {
          // Si es una ruta relativa, convertirla a absoluta usando API_URL
          smartImg.setAttribute('src', `${API_URL}${src}`);
        } else {
          // Usar tal cual para URLs absolutas u otros formatos
          smartImg.setAttribute('src', src);
        }
        
        // Reemplazar la imagen original con la nueva
        if (img.parentNode) {
          img.parentNode.replaceChild(smartImg, img);
        }
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="blog-content text-gray-200 prose prose-invert prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default BlogContent;