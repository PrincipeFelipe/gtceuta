import React, { useState } from 'react';
import { normalizeImageUrl } from '../../utils/imageUtils';

interface ImageThumbnailProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: string;
  height?: string;
  placeholder?: string;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ 
  src, 
  alt, 
  className = '', 
  width = '100%', 
  height = '100%',
  placeholder = '/images/fallback-image.png'
}) => {
  const [error, setError] = useState(false);
  
  const normalizedSrc = !error && src ? normalizeImageUrl(src) : placeholder;

  const handleError = () => {
    if (!error) {
      setError(true);
      console.warn(`Error loading image: ${src}`);
    }
  };

  return (
    <img 
      src={normalizedSrc}
      alt={alt}
      className={`object-cover ${className}`}
      style={{ width, height }}
      onError={handleError}
    />
  );
};

export default ImageThumbnail;