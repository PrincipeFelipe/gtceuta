import React, { useState } from 'react';
import { Download as DownloadIcon } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Construir una URL absoluta para evitar problemas de CORS
  const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;
  
  // Manejar errores de carga
  const handleLoadError = () => {
    console.error('Error al cargar el PDF');
    setLoading(false);
    setError(true);
  };
  
  const handleLoadSuccess = () => {
    setLoading(false);
    setError(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 rounded-full p-2 text-white hover:bg-red-700 z-10"
          aria-label="Cerrar PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">Bases del Torneo</h3>
            
            {/* Botón de descarga */}
            <a 
              href={pdfUrl} 
              download
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              aria-label="Descargar bases en PDF"
            >
              <DownloadIcon size={18} aria-hidden="true" />
              <span>Descargar PDF</span>
            </a>
          </div>
          
          <div className="flex-grow w-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
                <p className="text-red-500 text-lg mb-4">No se pudo cargar el documento</p>
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                >
                  Abrir en nueva pestaña
                </a>
              </div>
            )}
            
            <object
              data={absolutePdfUrl}
              type="application/pdf"
              className="w-full h-full rounded-md"
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
            >
              <p className="text-center p-4 bg-gray-900 text-white">
                Tu navegador no puede mostrar PDFs.{' '}
                <a 
                  href={absolutePdfUrl} 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-red-400 underline"
                >
                  Descargar PDF
                </a>
              </p>
            </object>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;