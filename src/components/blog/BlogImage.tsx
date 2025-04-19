import React, { useState } from 'react';
import { API_URL } from '../../config/api';

interface BlogImageProps {
  src: string;
  alt?: string;
  className?: string;
}

const BlogImage: React.FC<BlogImageProps> = ({ src, alt = '', className = '' }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    if (hasError) return; // Evitar bucle infinito
    
    setHasError(true);
    console.error(`Error al cargar imagen: ${currentSrc}`);
    
    // Si es una ruta relativa, intentar con URL absoluta
    if (src.startsWith('/uploads')) {
      // Intentar con API_URL primero
      const newSrc = `${API_URL}${src}`;
      console.log(`Intentando con URL absoluta: ${newSrc}`);
      setCurrentSrc(newSrc);
      
      // Si sigue fallando, se manejará en el siguiente onError
    }
  };
  
  const handleSecondError = () => {
    console.error(`Error persistente al cargar imagen: ${currentSrc}`);
    
    // Última opción: URL con origin actual
    if (src.startsWith('/uploads')) {
      const finalSrc = `${window.location.origin}${src}`;
      console.log(`Último intento con origen actual: ${finalSrc}`);
      setCurrentSrc(finalSrc);
    } else {
      // Si todo falla, usar imagen por defecto
      setCurrentSrc('/images/blog/default-post.jpg');
    }
  };
  
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${!isLoaded && !hasError ? 'loading' : ''} ${hasError ? 'error' : ''}`}
      onLoad={() => setIsLoaded(true)}
      onError={hasError ? handleSecondError : handleError}
    />
  );
};

export default BlogImage;