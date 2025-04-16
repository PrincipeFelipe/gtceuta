import React, { useState } from 'react';
import { normalizeImageUrl } from '../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  sizes = '100vw',
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const normalizedSrc = normalizeImageUrl(src);

  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    
    if (onError) {
      onError(e);
    } else {
      // Fallback predeterminado
      const target = e.target as HTMLImageElement;
      target.src = '/images/blog/default-post.png';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="animate-pulse w-12 h-12 bg-gray-700 rounded-full"></div>
        </div>
      )}
      <img
        src={normalizedSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage;