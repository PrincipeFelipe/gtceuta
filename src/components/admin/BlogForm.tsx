import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import blogService, { BlogPost } from '../../services/BlogService';
import { Save, X, Image, Calendar, Eye, Code } from 'lucide-react';
import AdminLayout from './AdminLayout';
import ImageEditor from './ImageEditor';

// Importamos TiptapEditor y su tipo de referencia
import TiptapEditor, { TiptapEditorRef } from './TiptapEditor';
import '../../styles/tiptap.css';

// Añadir la importación
import { normalizeImageUrl } from '../../utils/imageUtils';

import { API_URL } from '../../config/api';

// Categorías disponibles
const categories = [
  { id: 'guias', name: 'Guías y tutoriales' },
  { id: 'torneos', name: 'Torneos' },
  { id: 'ceuta', name: 'Ceuta' },
  { id: 'estrategia', name: 'Estrategia' }
];

// Añade esta función auxiliar para formatear la fecha (puedes colocarla antes del componente BlogForm)
const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Verificar que la fecha es válida
  if (isNaN(date.getTime())) return '';
  
  // Formato YYYY-MM-DD para input type="date"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const BlogForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '/images/blog/default-post.jpg',
    date: new Date().toISOString().split('T')[0],
    category: 'guias',
    published: false
  });

  // Estados UI
  const [showHtml, setShowHtml] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Estado para el editor de imágenes
  const [imageEditorState, setImageEditorState] = useState<{
    open: boolean;
    src: string | null;
    callback: ((url: string) => void) | null;
  }>({
    open: false,
    src: null,
    callback: null
  });

  // Añadir una referencia al editor Tiptap
  const tiptapRef = useRef<TiptapEditorRef>(null);

  // Añadir este estado para rastrear imágenes
  const [trackingImages, setTrackingImages] = useState<Set<string>>(new Set());

  // Función para normalizar HTML antes de pasarlo al editor
  const preprocessHtmlForTiptap = (html: string): string => {
    if (!html) return '';
    
    // Crear un DOM temporal para manipular el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Procesar todas las imágenes
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      // Asegurarse de que la imagen tenga los atributos necesarios para Tiptap
      if (img.src) {
        // Si es necesario, puedes ajustar atributos aquí
        img.setAttribute('data-tiptap-image', 'true');
      }
    });
    
    console.log("HTML procesado para Tiptap:", tempDiv.innerHTML.substring(0, 100) + "...");
    return tempDiv.innerHTML;
  };

  // Añadir esta función para verificar las imágenes en el HTML
  const checkImagesInContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const images = tempDiv.querySelectorAll('img');
    console.log(`Encontradas ${images.length} imágenes en el contenido:`);
    
    // Crear un array para seguir el estado de carga
    const imagesToLoad = images.length;
    let loadedImages = 0;
    let errorImages = 0;
    
    images.forEach((img, index) => {
      // Normalizar la URL (por si acaso)
      const originalSrc = img.src;
      let normalizedSrc = originalSrc.replace(/\\/g, '/');
      
      console.log(`${index + 1}. src original: ${originalSrc}`);
      
      if (normalizedSrc !== originalSrc) {
        console.log(`   src normalizada: ${normalizedSrc}`);
      }
      
      // Verificar la carga de la imagen correctamente
      const testImg = document.createElement('img');
      
      testImg.onload = () => {
        loadedImages++;
        console.log(`✅ Imagen ${index + 1} cargada correctamente (${loadedImages}/${imagesToLoad})`);
      };
      
      testImg.onerror = (e) => {
        errorImages++;
        console.error(`❌ Error al cargar la imagen ${index + 1}:`, e);
        console.error(`   URL problemática: ${testImg.src}`);
        
        // Intento de diagnóstico adicional
        const imgUrl = new URL(testImg.src);
        console.log(`   - Protocolo: ${imgUrl.protocol}`);
        console.log(`   - Host: ${imgUrl.host}`);
        console.log(`   - Pathname: ${imgUrl.pathname}`);
      };
      
      // Asignar la URL normalizada
      testImg.src = normalizedSrc;
    });
  };

  // Cargar datos del post si estamos en modo edición
  useEffect(() => {
    const loadPost = async () => {
      if (id) {
        setLoading(true);
        try {
          const post = await blogService.getPostById(Number(id));
          if (post) {
            console.log("Post cargado:", post.title);
            console.log("Contenido HTML recibido:", post.content ? post.content.length : 0, "caracteres");
            
            // Verificar si el contenido tiene imágenes
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.content || '';
            const images = tempDiv.querySelectorAll('img');
            console.log("Imágenes encontradas en el HTML:", images.length);
            
            images.forEach((img, index) => {
              console.log(`Imagen ${index + 1}:`, img.src.substring(0, 50) + "...");
            });
            
            // Preprocesar el contenido HTML para Tiptap
            const processedContent = preprocessHtmlForTiptap(post.content || '');
            
            // Asegurar que todos los campos existan
            setFormData({
              title: post.title || '',
              slug: post.slug || '',
              excerpt: post.excerpt || '',
              content: processedContent, // Usar el contenido procesado
              image: post.image || '/images/blog/default-post.jpg',
              date: formatDateForInput(post.date || new Date().toISOString().split('T')[0]),
              category: post.category || 'guias',
              published: post.published || false
            });
          } else {
            setError("Post no encontrado");
            navigate("/admin/blog");
          }
        } catch (err) {
          console.error("Error al cargar el post:", err);
          setError(`Error al cargar el post: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPost();
  }, [id, navigate]);

  // Generar slug automático basado en el título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD') // Normalizar acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s]/gi, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-'); // Evitar múltiples guiones seguidos
  };

  // Añade esta función para normalizar URLs en el contenido HTML
  const normalizeContentImageUrls = (html: string): string => {
    // Crear un DOM temporal para manipular el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Encontrar todas las imágenes
    const images = tempDiv.querySelectorAll('img');
    let modified = false;
    
    images.forEach(img => {
      const originalSrc = img.getAttribute('src') || '';
      
      // Si la URL contiene backslashes, normalizarla
      if (originalSrc.includes('\\')) {
        const normalizedSrc = originalSrc.replace(/\\/g, '/');
        img.setAttribute('src', normalizedSrc);
        modified = true;
        console.log(`URL de imagen normalizada: ${originalSrc} -> ${normalizedSrc}`);
      }
    });
    
    // Devolver el HTML modificado solo si hubo cambios
    return modified ? tempDiv.innerHTML : html;
  };

  // En la función de normalización de contenido, rastrear imágenes actuales
  const normalizeAndTrackImages = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Encontrar todas las imágenes y guardar sus URLs
    const images = tempDiv.querySelectorAll('img');
    const currentImages = new Set<string>();
    
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src && src.includes('/uploads/')) {
        currentImages.add(src);
      }
      
      // Normalizar la URL si es necesario
      if (src.includes('\\')) {
        const normalizedSrc = src.replace(/\\/g, '/');
        img.setAttribute('src', normalizedSrc);
      }
    });
    
    // Detectar imágenes eliminadas (las que estaban antes pero ya no están)
    if (trackingImages.size > 0) {
      trackingImages.forEach(oldImageUrl => {
        if (!currentImages.has(oldImageUrl) && oldImageUrl.includes('/uploads/')) {
          // La imagen ya no está en el contenido, eliminarla del servidor
          console.log('Imagen eliminada del contenido:', oldImageUrl);
          deleteImageFromServer(oldImageUrl);
        }
      });
    }
    
    // Actualizar el tracking con las imágenes actuales
    setTrackingImages(currentImages);
    
    return tempDiv.innerHTML;
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (field: keyof Omit<BlogPost, 'id'>, value: any) => {
    setFormData(prev => {
      let updatedValue = value;
      
      // Si el campo es 'content', normalizar URLs de imágenes
      if (field === 'content') {
        updatedValue = normalizeAndTrackImages(value);
      }
      
      const updated = { ...prev, [field]: updatedValue };
      
      // Actualizar el slug automáticamente si se cambió el título
      if (field === 'title') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const postToSubmit = {
        ...formData,
        // Asegurarse de que la fecha esté en formato ISO para la base de datos
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
      };

      if (id) {
        // Modo edición
        await blogService.updatePost({
          ...postToSubmit,
          id: Number(id)
        } as BlogPost);
      } else {
        // Modo creación
        await blogService.addPost(postToSubmit);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError('Error al guardar el post');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Modificar handleImageChange para subir la imagen al servidor
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      // Mostrar indicador de carga si lo necesitas
      // setUploading(true);
      
      // Convertir a base64 para enviar al servidor
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      // Busca la sección donde se sube la imagen destacada
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // IMPORTANTE: Quitar el /api de la ruta
        const response = await fetch(`${API_URL}/upload/blog-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64 })
        });
        
        if (!response.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const data = await response.json();
        handleChange('image', data.url);
      };
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
      // setUploading(false);
    }
  };

  // Modificar el manejador de imágenes para el contenido
  const handleContentImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = () => {
      setImageEditorState({
        open: true,
        src: reader.result as string,
        callback: (editedImageUrl) => {
          console.log("Imagen editada con URL:", editedImageUrl);
          
          // Normalizar URL para asegurar que es accesible en el frontend
          let imageUrl = editedImageUrl;
          
          // Asegurarse de que la URL sea absoluta con el servidor correcto
          if (imageUrl && !imageUrl.startsWith('http')) {
            // Si la URL es relativa, construirla correctamente
            // Eliminar barra inicial si existe para evitar doble barra
            if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl.substring(1);
            }
            
            // Agregar la URL base
            imageUrl = `${window.location.origin}/${imageUrl}`;
          }
          
          console.log("URL final de imagen:", imageUrl);
          
          // Usar la referencia para insertar la imagen editada
          if (tiptapRef.current) {
            tiptapRef.current.insertImage(imageUrl);
            
            // Forzar actualización del formulario también después de un tiempo
            setTimeout(() => {
              if (tiptapRef.current?.editor) {
                const html = tiptapRef.current.editor.getHTML();
                handleChange('content', html);
              }
            }, 100);
          }
          
          setImageEditorState({
            open: false,
            src: null,
            callback: null
          });
        }
      });
    };
  };

  // En la sección de previsualización de imagen:
  const renderImagePreview = () => {
    if (formData.image) {
      return (
        <div className="relative h-40 bg-gray-700 rounded-lg overflow-hidden">
          <img 
            src={normalizeImageUrl(formData.image)} 
            alt="Vista previa" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Si hay un error, usar una imagen de placeholder
              (e.target as HTMLImageElement).src = '/images/fallback-image.png';
            }}
          />
          <button 
            type="button"
            onClick={handleRemoveFeaturedImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
            aria-label="Eliminar imagen"
          >
            <X size={16} />
          </button>
        </div>
      );
    }
  
    return (
      <div className="flex items-center justify-center h-40 bg-gray-700 rounded-lg border-2 border-dashed border-gray-500">
        <span className="text-gray-400">Sin imagen</span>
      </div>
    );
  };

  // Añade este componente temporal para probar el acceso a las imágenes
  // Colócalo antes del return principal
  const TestImageComponent = () => {
    const [imagePath, setImagePath] = useState('');
    const [testResult, setTestResult] = useState<string | null>(null);
    
    const testImage = () => {
      if (!imagePath) return;
      
      const img = new Image();
      img.onload = () => setTestResult(`✅ La imagen cargó correctamente: ${imagePath}`);
      img.onerror = () => setTestResult(`❌ Error al cargar la imagen: ${imagePath}`);
      img.src = imagePath;
    };
    
    return (
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold text-white mb-2">Prueba de acceso a imágenes</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
            className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
            placeholder="Pega la URL de la imagen a probar"
          />
          <button
            type="button"
            onClick={testImage}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Probar
          </button>
        </div>
        {testResult && (
          <div className={`mt-2 p-2 rounded ${testResult.startsWith('✅') ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            {testResult}
          </div>
        )}
        {imagePath && (
          <div className="mt-2">
            <p className="text-sm text-gray-400 mb-1">Vista previa:</p>
            <img 
              src={imagePath} 
              alt="Test" 
              className="max-h-32 border border-gray-700 rounded"
              onError={() => console.log("Error al cargar vista previa")} 
            />
          </div>
        )}
      </div>
    );
  };

  // Mejorar la función para eliminar imágenes del servidor
const deleteImageFromServer = async (imageUrl: string) => {
  console.log("Intentando eliminar imagen:", imageUrl);
  
  try {
    const response = await fetch(`${API_URL}/delete-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error al eliminar la imagen:', data.message || response.statusText);
      return false;
    } else {
      console.log('Imagen eliminada correctamente:', data.message);
      return true;
    }
  } catch (error) {
    console.error('Error en la petición para eliminar imagen:', error);
    return false;
  }
};

  // Modifica la función para eliminar la imagen destacada
  const handleRemoveFeaturedImage = () => {
    // Guardar la URL actual antes de quitarla
    const currentImageUrl = formData.image;
    
    // Actualizar el estado del formulario
    setFormData(prev => ({ ...prev, image: '' }));
    
    // Si la imagen no es la predeterminada, eliminarla del servidor
    if (currentImageUrl && !currentImageUrl.includes('default-post.jpg')) {
      deleteImageFromServer(currentImageUrl);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          {id ? 'Editar Post' : 'Crear Nuevo Post'}
        </h1>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg mb-6">
            <p className="flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </p>
          </div>
        )}

        <TestImageComponent />
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            {/* Título y Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-gray-300">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-300">URL amigable (slug)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <p className="text-xs text-gray-400">
                  El slug se usa para la URL: gtceuta.com/blog/tu-slug
                </p>
              </div>
            </div>

            {/* Fecha y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 gap-1">
                  <Calendar size={16} />
                  <span>Fecha</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-300">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Extracto */}
            <div className="space-y-2">
              <label className="block text-gray-300">Extracto</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={3}
                required
              ></textarea>
            </div>

            {/* Imagen destacada */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-300 gap-1">
                <Image size={16} />
                <span>Imagen destacada</span>
              </label>
              
              <div className="flex items-center gap-4">
                {renderImagePreview()}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-red-600 file:text-white
                      hover:file:bg-red-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    O ingresa la URL de una imagen existente:
                  </p>
                  <input
                    type="text"
                    value={typeof formData.image === 'string' ? formData.image : ''}
                    onChange={(e) => handleChange('image', e.target.value)}
                    className="w-full p-2 mt-1 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="/images/blog/mi-imagen.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Contenido (Tiptap Editor) */}
            <div className="space-y-2">
              <label className="block text-gray-300">Contenido</label>
              <TiptapEditor 
                ref={tiptapRef}
                value={formData.content}
                onChange={(content) => {
                  handleChange('content', content);
                  checkImagesInContent(content);
                }}
                onImageSelect={handleContentImage}
              />
              
              {/* Botones para HTML y Vista Previa */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowHtml(!showHtml)}
                  className="flex items-center text-sm text-gray-400 hover:text-white"
                >
                  <Code size={16} className="mr-1" />
                  {showHtml ? 'Ocultar HTML' : 'Ver HTML'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-sm text-gray-400 hover:text-white"
                >
                  <Eye size={16} className="mr-1" />
                  {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
                </button>
              </div>

              {/* HTML */}
              {showHtml && (
                <div className="mt-2 p-4 bg-gray-800 rounded-lg overflow-auto max-h-60">
                  <pre className="text-xs text-gray-300">{formData.content}</pre>
                </div>
              )}
              
              {/* Vista previa */}
              {showPreview && formData.content && (
                <div className="mt-4 border border-gray-700 rounded-lg">
                  <div className="bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300">Vista previa del contenido</h3>
                  </div>
                  <div 
                    className="p-4 blog-content-preview"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              )}
            </div>

            {/* Estado de publicación */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="publishStatus"
                  checked={formData.published}
                  onChange={(e) => handleChange('published', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <label htmlFor="publishStatus" className="ml-2 text-gray-300">
                  Publicar inmediatamente
                </label>
              </div>
              <p className="text-xs text-gray-400">
                Si no está marcado, el post se guardará como borrador.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save size={18} />
                )}
                <span>{id ? 'Actualizar Post' : 'Publicar Post'}</span>
              </button>
            </div>
          </form>
        )}
        
        {/* Editor de Imágenes */}
        {imageEditorState.open && (
          <ImageEditor
            src={imageEditorState.src}
            onSave={(editedImage) => {
              if (imageEditorState.callback) {
                imageEditorState.callback(editedImage);
              }
            }}
            onCancel={() => {
              setImageEditorState({
                open: false,
                src: null,
                callback: null
              });
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default BlogForm;