import React, { useState } from 'react';
import { API_URL } from '../../config/api';

interface SmartImageProps {
  src: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc = '/images/placeholders/image-placeholder.jpg',
  onLoad,
  onError
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalizar URL de imagen
  const normalizeImageUrl = (url: string | null): string => {
    if (!url) return fallbackSrc;
    
    // Si es una URL absoluta, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si es una ruta relativa que comienza con /, intentar con la URL base
    if (url.startsWith('/')) {
      // Comprobar si es ruta de media
      if (url.startsWith('/media/')) {
        return `${API_URL}${url}`;
      }
      return url;
    }
    
    // Si es una ruta de media sin el /
    if (url.startsWith('media/')) {
      return `${API_URL}/${url}`;
    }
    
    return url;
  };

  const handleError = () => {
    if (hasError) return; // Evitar bucle infinito
    
    setHasError(true);
    setIsLoaded(false);
    console.warn(`Error cargando imagen: ${imgSrc}`);
    
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-5 h-5 border-t-2 border-red-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={normalizeImageUrl(imgSrc)}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default SmartImage;