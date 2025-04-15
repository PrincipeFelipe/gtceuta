import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowLeftRight, 
  ArrowUpDown,
  Columns, 
  SunDim 
} from 'lucide-react';

interface ImageEditorProps {
  src: string | null;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
  const [editedSrc, setEditedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cargar la imagen inicial
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setIsLoading(false);
      applyEdits(img);
    };
    img.onerror = (e) => {
      console.error("Error loading image", e);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  // Aplicar ediciones y actualizar la vista previa
  const applyEdits = (imageObj?: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageObj || new Image();
    if (!imageObj) {
      img.crossOrigin = "anonymous";
      img.src = src || '';
    }
    
    img.onload = () => {
      // Configurar el tamaño del canvas
      canvas.width = width;
      canvas.height = height;
      
      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Guardar el estado
      ctx.save();
      
      // Aplicar transformaciones
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Trasladar al centro para la rotación
      ctx.translate(centerX, centerY);
      
      // Aplicar rotación
      ctx.rotate((rotate * Math.PI) / 180);
      
      // Aplicar volteo
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      
      // Dibujar imagen
      ctx.drawImage(
        img,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
      
      // Restaurar el estado
      ctx.restore();
      
      // Aplicar filtros
      if (brightness !== 100 || contrast !== 100) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Ajustar brillo y contraste
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Ajuste de brillo: multiplicar por un factor (brightness / 100)
          // Ajuste de contraste: aplicar fórmula f(x) = (x - 128) * (contrast / 100) + 128
          data[i] = Math.min(255, Math.max(0, ((r - 128) * (contrast / 100)) + 128 * (brightness / 100)));
          data[i + 1] = Math.min(255, Math.max(0, ((g - 128) * (contrast / 100)) + 128 * (brightness / 100)));
          data[i + 2] = Math.min(255, Math.max(0, ((b - 128) * (contrast / 100)) + 128 * (brightness / 100)));
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      // Actualizar la imagen editada
      setEditedSrc(canvas.toDataURL('image/jpeg'));
    };
    
    // Solo necesitamos cargar la imagen si no se proporcionó
    if (!imageObj) {
      img.onerror = () => console.error("Error applying edits");
    }
  };

  // Actualizar la vista previa cuando cambien las ediciones
  useEffect(() => {
    if (!isLoading) {
      applyEdits();
    }
  }, [width, height, brightness, contrast, rotate, flipX, flipY, isLoading]);

  // Redimensionar manteniendo la proporción
  const handleResize = (newWidth: number) => {
    const aspectRatio = width / height;
    setWidth(newWidth);
    setHeight(Math.round(newWidth / aspectRatio));
  };

  // Guardar la imagen editada
  const handleSave = () => {
    if (editedSrc) {
      onSave(editedSrc);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Editor de imágenes</h3>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Vista previa */}
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-gray-800">
            {isLoading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
            ) : (
              <div className="relative">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[60vh] mx-auto border border-gray-700 shadow-lg"
                />
                <img src={editedSrc || ''} className="hidden" alt="edited preview" /> {/* Para ver la vista previa final */}
              </div>
            )}
          </div>
          
          {/* Controles */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-800 p-4 space-y-6">
            {/* Redimensionar */}
            <div className="space-y-2">
              <label className="flex items-center text-sm text-gray-300 gap-1">
                <Columns size={16} />
                <span>Tamaño</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleResize(Number(e.target.value))}
                  className="p-1 bg-gray-800 border border-gray-700 rounded text-white w-20"
                />
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  value={height}
                  readOnly
                  className="p-1 bg-gray-800 border border-gray-700 rounded text-gray-400 w-20"
                />
                <span className="text-gray-400 text-xs ml-1">px</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResize(Math.round(width * 0.9))}
                  className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded p-2 text-sm text-gray-300"
                  title="Reducir tamaño"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => handleResize(Math.round(width * 1.1))}
                  className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded p-2 text-sm text-gray-300"
                  title="Aumentar tamaño"
                >
                  <ZoomIn size={16} />
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                      setWidth(img.width);
                      setHeight(img.height);
                      setBrightness(100);
                      setContrast(100);
                      setRotate(0);
                      setFlipX(false);
                      setFlipY(false);
                      applyEdits(img);
                    };
                    img.src = src || '';
                  }}
                  className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded p-2 text-sm text-gray-300"
                  title="Restablecer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            
            {/* Control de brillo */}
            <div className="space-y-2">
              <label className="flex items-center text-sm text-gray-300 gap-1">
                <SunDim size={16} />
                <span>Brillo: {brightness}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-red-600 h-1"
              />
            </div>
            
            {/* Control de contraste */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Contraste: {contrast}%</label>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-red-600 h-1"
              />
            </div>
            
            {/* Rotación y volteo */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Transformaciones</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotate((prev) => (prev + 90) % 360)}
                  className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded p-2 text-sm text-gray-300"
                >
                  <RotateCcw size={16} /> Rotar 90°
                </button>
                <button
                  onClick={() => setFlipX(!flipX)}
                  className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded p-2 text-sm text-gray-300"
                >
                  <ArrowLeftRight size={16} /> Voltear H
                </button>
                <button
                  onClick={() => setFlipY(!flipY)}
                  className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded p-2 text-sm text-gray-300"
                >
                  <ArrowUpDown size={16} /> Voltear V
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
            disabled={isLoading || !editedSrc}
          >
            <Save size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;