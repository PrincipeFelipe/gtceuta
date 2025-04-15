import React, { useState, useEffect } from 'react';
import { Download as DownloadIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
  title?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, onClose, title = "Cartel del Torneo" }) => {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    // Bloquear el scroll cuando se abre el visor
    document.body.style.overflow = 'hidden';
    
    // Listener para cerrar con ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 rounded-full p-2 text-white hover:bg-red-700 z-10"
          aria-label="Cerrar imagen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">{title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                aria-label="Alejar"
              >
                <ZoomOutIcon size={18} />
              </button>
              <div className="w-16 text-center text-gray-300">
                {Math.round(scale * 100)}%
              </div>
              <button
                onClick={zoomIn}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                aria-label="Acercar"
              >
                <ZoomInIcon size={18} />
              </button>
              <a 
                href={imageUrl} 
                download
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition duration-300 ml-2"
              >
                <DownloadIcon size={16} />
                <span>Descargar</span>
              </a>
            </div>
          </div>
          
          <div className="overflow-auto max-h-[75vh] bg-gray-900 rounded-md">
            <div className="min-h-[75vh] flex items-center justify-center p-4">
              <img 
                src={imageUrl} 
                alt={title}
                className="transition-transform duration-200 ease-in-out"
                style={{ 
                  transform: `scale(${scale})`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;