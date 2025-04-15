import React from 'react';
import { Download as DownloadIcon } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onClose }) => {
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
              download="Bases GT Ceuta 2025.pdf"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              aria-label="Descargar bases en PDF"
            >
              <DownloadIcon size={18} aria-hidden="true" />
              <span>Descargar PDF</span>
            </a>
          </div>
          
          <div className="flex-grow w-full">
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full rounded-md"
              title="Bases del torneo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;