import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCw, ZoomIn, ZoomOut, Crop, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config/api';

interface ImageEditorProps {
  src: string | null;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Estados para edición de imagen
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Canvas para manipulación de imagen
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Estado para tracking de la imagen original y la editada
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [editedImageSrc, setEditedImageSrc] = useState<string | null>(null);

  // Estado para debugging
  const [debugInfo, setDebugInfo] = useState({
    imageSize: '0 bytes',
    dimensions: '0x0',
    format: 'unknown'
  });

  useEffect(() => {
    // Verificar que src es válido
    if (!src) {
      setError("No se proporcionó una imagen válida");
      return;
    }

    // Información para debugging
    if (src.startsWith('data:')) {
      // Es una imagen base64
      const sizeInBytes = Math.round((src.length * 3) / 4);
      const sizeInKB = Math.round(sizeInBytes / 1024);
      setDebugInfo(prev => ({
        ...prev,
        imageSize: `~${sizeInKB} KB`,
        format: src.split(';')[0].split('/')[1]
      }));
      
      // Comprobar si el base64 es muy grande
      if (sizeInKB > 5000) {
        console.warn("La imagen es muy grande:", sizeInKB, "KB");
      }
    }
    
    // Reiniciar estados de edición cuando cambia la imagen
    setZoomLevel(1);
    setRotation(0);
    setIsCropping(false);
    setEditedImageSrc(null);
  }, [src]);

  useEffect(() => {
    if (originalImage && imageLoaded) {
      applyImageEdits();
    }
  }, [zoomLevel, rotation, originalImage, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (imageRef.current) {
      // Guardar referencia a la imagen original
      setOriginalImage(imageRef.current);
      
      setDebugInfo(prev => ({
        ...prev,
        dimensions: `${imageRef.current.naturalWidth}x${imageRef.current.naturalHeight}`
      }));
      
      // Inicializar el crop area cuando la imagen se carga
      setCropArea({
        x: 0,
        y: 0,
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };
  
  // Función para aplicar ediciones a la imagen
  const applyImageEdits = () => {
    if (!originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar el tamaño del canvas según la imagen y rotación
    const imgWidth = originalImage.naturalWidth;
    const imgHeight = originalImage.naturalHeight;
    
    // Determinar si necesitamos intercambiar ancho y alto debido a la rotación
    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? imgHeight : imgWidth;
    canvas.height = isRotated ? imgWidth : imgHeight;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Guardar el estado del canvas
    ctx.save();
    
    // Mover el origen al centro del canvas para la rotación
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Rotar el canvas
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Aplicar zoom
    ctx.scale(zoomLevel, zoomLevel);
    
    // Dibujar la imagen centrada
    ctx.drawImage(
      originalImage,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight
    );
    
    // Restaurar el estado del canvas
    ctx.restore();
    
    // Convertir el canvas a imagen
    try {
      const newImageSrc = canvas.toDataURL('image/jpeg', 0.9);
      setEditedImageSrc(newImageSrc);
    } catch (e) {
      console.error('Error al convertir canvas a imagen:', e);
      setError('Error al procesar la imagen');
    }
  };
  
  // Funciones para controles de edición
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3)); // Max zoom: 3x
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Min zoom: 0.5x
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const toggleCrop = () => {
    setIsCropping(!isCropping);
  };
  
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setIsCropping(false);
    setEditedImageSrc(null);
  };

  // Actualiza handleSaveImage para manejar correctamente las URLs
  const handleSaveImage = async () => {
    const imageToSave = editedImageSrc || src;
    if (!imageToSave) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageToSave,
          type: 'blog-content'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // IMPORTANTE: Construir la URL correcta para acceder desde el frontend
      // Usar la URL del servidor API, no la URL del frontend
      const imageUrl = `${API_URL}${data.url}`;
      console.log("URL de imagen guardada:", imageUrl);
      
      onSave(imageUrl);
    } catch (err) {
      console.error('Error al guardar la imagen:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Editor de Imagen</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 m-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {/* Contenedor de la imagen con información de depuración */}
        <div className="flex-1 overflow-auto p-4 relative">
          {!imageLoaded && src && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}
          
          {/* Mostrar información de depuración */}
          <div className="bg-gray-900 p-2 mb-2 rounded text-xs text-gray-400 flex justify-between">
            <span>Formato: {debugInfo.format}</span>
            <span>Tamaño: {debugInfo.imageSize}</span>
            <span>Dimensiones: {debugInfo.dimensions}</span>
            {zoomLevel !== 1 && <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>}
            {rotation !== 0 && <span>Rotación: {rotation}°</span>}
          </div>

          {/* Canvas oculto para manipulación de imagen */}
          <canvas 
            ref={canvasRef}
            className="hidden"
          />

          {/* Contenedor de la imagen con borde para visualizar mejor */}
          <div className="border border-gray-700 rounded overflow-hidden flex justify-center bg-gray-900 min-h-[300px] relative">
            {/* Imagen original (oculta si hay una editada) */}
            {src && !editedImageSrc && (
              <img
                ref={imageRef}
                src={src}
                alt="Imagen para editar"
                className="max-w-full max-h-[50vh] object-contain"
                onLoad={handleImageLoad}
                onError={(e) => {
                  console.error("Error al cargar la imagen", e);
                  setError("No se pudo cargar la imagen. Formato no soportado o imagen corrupta.");
                }}
              />
            )}
            
            {/* Imagen editada */}
            {editedImageSrc && (
              <img
                src={editedImageSrc}
                alt="Imagen editada"
                className="max-w-full max-h-[50vh] object-contain"
              />
            )}
            
            {/* Overlay para recorte (implementación simplificada) */}
            {isCropping && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white p-3 bg-red-800 rounded">
                  Funcionalidad de recorte en desarrollo...
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Controles de edición */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <button
                onClick={handleZoomIn}
                className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={handleZoomOut}
                className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={handleRotate}
                className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
                title="Rotate"
              >
                <RotateCw size={20} />
              </button>
              <button
                onClick={toggleCrop}
                className={`${isCropping ? 'bg-red-600' : 'bg-gray-700'} text-white p-2 rounded hover:bg-gray-600`}
                title="Crop"
              >
                <Crop size={20} />
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
                title="Reset"
              >
                <RefreshCw size={20} />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveImage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2"
                disabled={loading || (!src && !editedImageSrc)}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save size={18} />
                )}
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;