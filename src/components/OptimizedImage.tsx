import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  sizes = '100vw'
}) => {
  // IMPORTANTE: Utilizar la ruta original sin modificar
  return (
    <img
      src={src} // Usar la ruta tal como viene, sin añadir /optimized/
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      sizes={sizes}
      decoding="async"
      onError={(e) => {
        console.error(`Error loading image: ${src}`);
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/images/fallback-image.png';
      }}
    />
  );
};

export default OptimizedImage;