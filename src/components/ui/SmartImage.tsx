import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = '',
  fallbackSrc = '/images/blog/default-post.jpg',
  className = '',
  containerClassName = '',
  ...props
}) => {
  // Normalizar la URL inicial
  const normalizeUrl = (url: string): string => {
    if (!url) return fallbackSrc;
    
    // Para URLs absolutas, dejarlas como están
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Para URLs relativas que comienzan con /uploads
    if (url.startsWith('/uploads')) {
      // En desarrollo, añadir API_URL
      if (window.location.hostname === 'localhost') {
        return `${API_URL}${url}`;
      }
    }
    
    return url;
  };
  
  const [currentSrc, setCurrentSrc] = useState<string>(normalizeUrl(src));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  
  // Si cambia la src externa, resetear el componente
  useEffect(() => {
    setCurrentSrc(normalizeUrl(src));
    setIsLoading(true);
    setHasError(false);
    setAttemptCount(0);
  }, [src]);
  
  const handleError = () => {
    console.error(`Error al cargar imagen (intento ${attemptCount + 1}):`, currentSrc);
    
    if (attemptCount >= 2) {
      // Si ya hemos intentado suficientes veces, usar la imagen de fallback
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    // Diferentes estrategias según el intento actual
    if (attemptCount === 0) {
      // Primera estrategia: intentar con URL relativa si es absoluta o viceversa
      if (currentSrc.startsWith('http')) {
        // Si es absoluta, intentar con relativa
        const relativeUrl = currentSrc.includes('/uploads/') 
          ? `/uploads/${currentSrc.split('/uploads/')[1]}` 
          : currentSrc;
        console.log('Intento 1: URL relativa:', relativeUrl);
        setCurrentSrc(relativeUrl);
      } else {
        // Si es relativa, intentar con absoluta usando API_URL
        const absoluteUrl = `${API_URL}${currentSrc.startsWith('/') ? '' : '/'}${currentSrc}`;
        console.log('Intento 1: URL absoluta con API_URL:', absoluteUrl);
        setCurrentSrc(absoluteUrl);
      }
    } else if (attemptCount === 1) {
      // Segunda estrategia: Usar window.location.origin
      const originUrl = `${window.location.origin}${currentSrc.startsWith('/') ? '' : '/'}${
        currentSrc.startsWith('http') ? currentSrc.split('/').slice(3).join('/') : currentSrc
      }`;
      console.log('Intento 2: URL con origen actual:', originUrl);
      setCurrentSrc(originUrl);
    }
    
    setAttemptCount(prev => prev + 1);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default SmartImage;