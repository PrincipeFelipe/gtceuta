import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCw, Crop, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { API_URL } from '../../config/api';

interface ImageEditorProps {
  src: string | null;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

// Definir los tamaños predefinidos para redimensionar
type SizePreset = {
  label: string;
  width: number;
  height?: number;
};

const IMAGE_SIZE_PRESETS: SizePreset[] = [
  { label: 'Original', width: 0 },
  { label: 'Grande (1024px)', width: 1024 },
  { label: 'Medio (768px)', width: 768 },
  { label: 'Pequeño (480px)', width: 480 },
  { label: 'Miniatura (240px)', width: 240 }
];

const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Estados para edición de imagen
  const [rotation, setRotation] = useState(0);
  
  // Nuevo estado para redimensionar
  const [selectedSize, setSelectedSize] = useState<SizePreset>(IMAGE_SIZE_PRESETS[0]);
  
  // Estado para recorte
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number, y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number, y: number } | null>(null);
  const [cropArea, setCropArea] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  // Canvas para manipulación de imagen
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Estado para tracking de la imagen original y la editada
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [editedImageSrc, setEditedImageSrc] = useState<string | null>(null);

  // Estado para debugging
  const [debugInfo, setDebugInfo] = useState({
    imageSize: '0 bytes',
    dimensions: '0x0',
    format: 'unknown'
  });

  // Container para el área de recorte
  const cropContainerRef = useRef<HTMLDivElement>(null);

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
    setRotation(0);
    setIsCropping(false);
    setCropArea(null);
    setCropStart(null);
    setCropEnd(null);
    setSelectedSize(IMAGE_SIZE_PRESETS[0]);
    setEditedImageSrc(null);
  }, [src]);

  useEffect(() => {
    if (originalImage && imageLoaded) {
      applyImageEdits();
    }
  }, [rotation, selectedSize, originalImage, imageLoaded]);

  useEffect(() => {
    // Si estamos en modo recorte y tenemos tanto inicio como fin, calcular el área
    if (isCropping && cropStart && cropEnd && cropContainerRef.current) {
      const container = cropContainerRef.current.getBoundingClientRect();
      const imgElement = cropContainerRef.current.querySelector('img');
      
      if (!imgElement) return;
      
      const imgRect = imgElement.getBoundingClientRect();
      
      // Calcular escala entre la imagen real y la mostrada
      const scaleX = originalImage ? originalImage.naturalWidth / imgRect.width : 1;
      const scaleY = originalImage ? originalImage.naturalHeight / imgRect.height : 1;
      
      // Calcular coordenadas relativas a la imagen
      const x1 = Math.max(0, (cropStart.x - imgRect.left));
      const y1 = Math.max(0, (cropStart.y - imgRect.top));
      const x2 = Math.min(imgRect.width, (cropEnd.x - imgRect.left));
      const y2 = Math.min(imgRect.height, (cropEnd.y - imgRect.top));
      
      // Crear área de recorte, asegurando valores positivos
      const newCropArea = {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
      };
      
      setCropArea(newCropArea);
    }
  }, [cropStart, cropEnd, isCropping, originalImage]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (imageRef.current) {
      // Guardar referencia a la imagen original
      setOriginalImage(imageRef.current);
      
      setDebugInfo(prev => ({
        ...prev,
        dimensions: `${imageRef.current.naturalWidth}x${imageRef.current.naturalHeight}`
      }));
    }
  };
  
  const applyImageEdits = () => {
    if (!originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Obtener dimensiones originales
    const imgWidth = originalImage.naturalWidth;
    const imgHeight = originalImage.naturalHeight;
    
    // Calcular dimensiones después del redimensionamiento (si se aplica)
    let targetWidth = imgWidth;
    let targetHeight = imgHeight;
    
    // Si se seleccionó un tamaño distinto al original
    if (selectedSize.width > 0) {
      const aspectRatio = imgWidth / imgHeight;
      
      if (selectedSize.height) {
        // Si se especificó tanto ancho como alto
        targetWidth = selectedSize.width;
        targetHeight = selectedSize.height;
      } else {
        // Si solo se especificó el ancho, mantener la proporción
        targetWidth = Math.min(selectedSize.width, imgWidth);
        targetHeight = targetWidth / aspectRatio;
      }
    }
    
    // Determinar si necesitamos intercambiar ancho y alto debido a la rotación
    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? targetHeight : targetWidth;
    canvas.height = isRotated ? targetWidth : targetHeight;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Guardar el estado del canvas
    ctx.save();
    
    // Mover el origen al centro del canvas para la rotación
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Rotar el canvas
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Dibujar la imagen centrada con el nuevo tamaño
    ctx.drawImage(
      originalImage,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight
    );
    
    // Restaurar el estado del canvas
    ctx.restore();
    
    // Convertir el canvas a imagen
    try {
      const newImageSrc = canvas.toDataURL('image/jpeg', 0.92);
      setEditedImageSrc(newImageSrc);
    } catch (e) {
      console.error('Error al convertir canvas a imagen:', e);
      setError('Error al procesar la imagen');
    }
  };
  
  // Función para aplicar recorte
  const applyCrop = () => {
    if (!cropArea || !originalImage || !cropCanvasRef.current) return;
    
    // Usar un canvas separado para recorte
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Obtener dimensiones del área de recorte
    const { x, y, width, height } = cropArea;
    
    // Configurar canvas para el recorte
    canvas.width = width;
    canvas.height = height;
    
    // Obtener la imagen actual (la que puede estar ya procesada con rotación/redim)
    const currentImg = editedImageSrc || src;
    
    if (currentImg) {
      // Crear una imagen temporal con la versión actual
      const img = new Image();
      img.onload = () => {
        // Dibujar solo la parte recortada
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        
        // Convertir el resultado a base64
        try {
          const croppedImageSrc = canvas.toDataURL('image/jpeg', 0.92);
          setEditedImageSrc(croppedImageSrc);
          
          // Salir del modo recorte
          setIsCropping(false);
          setCropArea(null);
          setCropStart(null);
          setCropEnd(null);
        } catch (e) {
          console.error('Error al recortar la imagen:', e);
          setError('Error al recortar la imagen');
        }
      };
      
      img.onerror = () => {
        setError('Error al cargar la imagen para recortar');
      };
      
      img.src = currentImg;
    }
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const toggleCrop = () => {
    // Si ya estábamos en modo recorte y tenemos un área seleccionada, aplicar
    if (isCropping && cropArea) {
      applyCrop();
    } else {
      // Entrar en modo recorte
      setIsCropping(!isCropping);
      setCropArea(null);
      setCropStart(null);
      setCropEnd(null);
    }
  };
  
  const handleReset = () => {
    setRotation(0);
    setIsCropping(false);
    setCropArea(null);
    setCropStart(null);
    setCropEnd(null);
    setSelectedSize(IMAGE_SIZE_PRESETS[0]);
    setEditedImageSrc(null);
  };

  // Manejo de eventos para el recorte
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping || !cropContainerRef.current) return;
    
    const rect = cropContainerRef.current.getBoundingClientRect();
    setCropStart({
      x: e.clientX,
      y: e.clientY
    });
    setCropEnd(null);
    setCropArea(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropStart) return;
    
    setCropEnd({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseUp = () => {
    if (!isCropping || !cropStart || !cropEnd) return;
    // El área de recorte ya se actualiza en el useEffect
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
      
      // Construir la URL correcta para acceder desde el frontend
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
  
  // Función para cambiar al siguiente/previo preset de tamaño
  const changeSizePreset = (direction: 'next' | 'prev') => {
    const currentIndex = IMAGE_SIZE_PRESETS.findIndex(size => 
      size.width === selectedSize.width && size.height === selectedSize.height
    );
    
    if (currentIndex === -1) return;
    
    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % IMAGE_SIZE_PRESETS.length
      : (currentIndex - 1 + IMAGE_SIZE_PRESETS.length) % IMAGE_SIZE_PRESETS.length;
      
    setSelectedSize(IMAGE_SIZE_PRESETS[newIndex]);
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
          <div className="bg-gray-900 p-2 mb-2 rounded text-xs text-gray-400 flex justify-between flex-wrap">
            <span>Formato: {debugInfo.format}</span>
            <span>Tamaño: {debugInfo.imageSize}</span>
            <span>Dimensiones: {debugInfo.dimensions}</span>
            {rotation !== 0 && <span>Rotación: {rotation}°</span>}
            {selectedSize.width > 0 && <span>Redimensionado: {selectedSize.label}</span>}
          </div>

          {/* Canvas ocultos para manipulación de imagen */}
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={cropCanvasRef} className="hidden" />

          {/* Contenedor de la imagen con borde para visualizar mejor */}
          <div 
            ref={cropContainerRef}
            className="border border-gray-700 rounded overflow-hidden flex justify-center bg-gray-900 min-h-[300px] relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
            
            {/* Overlay para recorte */}
            {isCropping && (
              <div className="absolute inset-0 bg-black bg-opacity-50">
                {cropArea && (
                  <div 
                    className="absolute border-2 border-white" 
                    style={{
                      left: `${cropArea.x}px`,
                      top: `${cropArea.y}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`,
                    }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-800 text-white px-3 py-1 rounded text-sm">
                    Selecciona el área a recortar
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Controles de edición */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex flex-col gap-4">
            {/* Control de tamaño */}
            <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
              <span className="text-white font-medium">Tamaño:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeSizePreset('prev')}
                  className="bg-gray-600 text-white p-1 rounded hover:bg-gray-500"
                  title="Tamaño anterior"
                >
                  <ArrowLeft size={16} />
                </button>
                
                <span className="text-white min-w-[100px] text-center">
                  {selectedSize.label}
                </span>
                
                <button
                  onClick={() => changeSizePreset('next')}
                  className="bg-gray-600 text-white p-1 rounded hover:bg-gray-500"
                  title="Tamaño siguiente"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={handleRotate}
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
                  title="Rotar 90°"
                >
                  <RotateCw size={20} />
                </button>
                <button
                  onClick={toggleCrop}
                  className={`${isCropping ? 'bg-red-600' : 'bg-gray-700'} text-white p-2 rounded hover:bg-gray-600`}
                  title={isCropping ? "Aplicar recorte" : "Activar recorte"}
                >
                  <Crop size={20} />
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
                  title="Restablecer imagen"
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
                  disabled={loading || (!src && !editedImageSrc) || isCropping}
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
    </div>
  );
};

export default ImageEditor;