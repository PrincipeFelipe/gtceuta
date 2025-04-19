// Crear este nuevo componente para diagnóstico

import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import SmartImage from '../ui/SmartImage';

const ImageDiagnostic: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const checkImage = async () => {
    if (!imageUrl) return;
    
    setLoading(true);
    setResults(null);
    
    try {
      // 1. Intentar cargar la imagen directamente
      const loadTest = new Promise<{success: boolean, error?: string}>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ 
          success: true,
          dimensions: {
            width: img.width,
            height: img.height
          }
        });
        img.onerror = () => resolve({ 
          success: false, 
          error: 'No se pudo cargar la imagen directamente' 
        });
        img.src = imageUrl;
      });
      
      // 2. Verificar si el archivo existe en el servidor
      let serverCheck;
      if (imageUrl.includes('/uploads/')) {
        // Extraer la ruta relativa
        const uploadsPath = imageUrl.split('/uploads/')[1];
        
        try {
          const response = await fetch(`${API_URL}/api/check-static?path=${uploadsPath}`);
          serverCheck = await response.json();
        } catch (err) {
          serverCheck = {
            success: false,
            error: err instanceof Error ? err.message : 'Error desconocido'
          };
        }
      }
      
      // 3. Construir variantes de la URL para probar
      const variants = [imageUrl];
      
      if (imageUrl.startsWith('/')) {
        variants.push(`${window.location.origin}${imageUrl}`);
        variants.push(`${API_URL}${imageUrl}`);
      }
      
      if (imageUrl.includes('localhost:4000') && window.location.port !== '4000') {
        variants.push(imageUrl.replace('http://localhost:4000', window.location.origin));
      }
      
      // 4. Extraer parte de uploads si existe
      const uploadsMatch = imageUrl.match(/.*?(\/uploads\/.*?)$/);
      if (uploadsMatch && uploadsMatch[1]) {
        variants.push(uploadsMatch[1]);
        variants.push(`${window.location.origin}${uploadsMatch[1]}`);
      }
      
      const loadResult = await loadTest;
      
      setResults({
        imageUrl,
        directLoad: loadResult,
        serverCheck,
        variants
      });
    } catch (err) {
      setResults({
        error: err instanceof Error ? err.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Diagnóstico de Imágenes</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="URL de imagen a diagnosticar"
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white"
        />
        <button
          onClick={checkImage}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Comprobando...' : 'Comprobar'}
        </button>
      </div>
      
      {results && (
        <div className="space-y-4">
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-bold mb-2">Carga directa:</h3>
            <div className="text-sm">
              {results.directLoad.success ? (
                <p className="text-green-400">✅ La imagen carga correctamente</p>
              ) : (
                <p className="text-red-400">❌ {results.directLoad.error}</p>
              )}
            </div>
          </div>
          
          {results.serverCheck && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <h3 className="font-bold mb-2">Estado en servidor:</h3>
              <div className="text-sm">
                {results.serverCheck.exists ? (
                  <p className="text-green-400">✅ Archivo encontrado en el servidor</p>
                ) : (
                  <p className="text-red-400">❌ Archivo no encontrado en el servidor</p>
                )}
                <p className="mt-1 text-gray-300">Ruta: {results.serverCheck.fullPath}</p>
              </div>
            </div>
          )}
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-bold mb-2">Vista previa:</h3>
            <div className="h-40 bg-gray-900 rounded relative">
              <SmartImage
                src={imageUrl}
                alt="Imagen diagnóstico"
                className="h-full max-w-full object-contain mx-auto"
                containerClassName="h-full"
                showFallbackOnError={false}
              />
            </div>
          </div>
          
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="font-bold mb-2">Variantes a probar:</h3>
            <ul className="space-y-1 text-sm">
              {results.variants.map((url: string, index: number) => (
                <li key={index} className="break-all">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {index + 1}. {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDiagnostic;