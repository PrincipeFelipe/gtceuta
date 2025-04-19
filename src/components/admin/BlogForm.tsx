import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import blogService, { BlogPost } from '../../services/BlogService';
import { Save, X, Image, Calendar, Eye, Code } from 'lucide-react';
import AdminLayout from './AdminLayout';
import ImageEditor from './ImageEditor';
import TiptapEditor, { TiptapEditorRef } from './TiptapEditor';
import '../../styles/tiptap.css';
import { normalizeImageUrl } from '../../utils/imageUtils';
import { API_URL } from '../../config/api';
import SmartImage from '../ui/SmartImage';

const categories = [
  { id: 'guias', name: 'Guías y tutoriales' },
  { id: 'torneos', name: 'Torneos' },
  { id: 'ceuta', name: 'Ceuta' },
  { id: 'estrategia', name: 'Estrategia' }
];

const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Añadir esta utilidad para diagnóstico de URLs

const DiagnosticImage = ({ url }: { url: string }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [normalizedUrl, setNormalizedUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!url) return;
    
    // Normalizar la URL para prueba
    const normalizedForTest = url.startsWith('/') 
      ? `${window.location.origin}${url}` 
      : url;
    setNormalizedUrl(normalizedForTest);
    
    const img = new Image();
    img.onload = () => setStatus('success');
    img.onerror = () => setStatus('error');
    img.src = normalizedForTest;
  }, [url]);
  
  return (
    <div className="bg-gray-800 p-3 rounded-lg mb-4">
      <div className="mb-2 text-sm">
        <span className="text-gray-400">URL original: </span>
        <span className="text-gray-300 break-all">{url}</span>
      </div>
      
      {normalizedUrl && (
        <div className="mb-2 text-sm">
          <span className="text-gray-400">URL para prueba: </span>
          <span className="text-gray-300 break-all">{normalizedUrl}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'loading' ? 'bg-yellow-500' :
          status === 'success' ? 'bg-green-500' :
          'bg-red-500'
        }`}></div>
        <span className="text-sm">
          {status === 'loading' ? 'Cargando...' :
           status === 'success' ? 'Accesible ✅' :
           'Inaccesible ❌'}
        </span>
      </div>
    </div>
  );
};

const BlogForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const [showHtml, setShowHtml] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [imageEditorState, setImageEditorState] = useState<{
    open: boolean;
    src: string | null;
    callback: ((url: string) => void) | null;
  }>({
    open: false,
    src: null,
    callback: null
  });

  const tiptapRef = useRef<TiptapEditorRef>(null);
  const [trackingImages, setTrackingImages] = useState<Set<string>>(new Set());

  const preprocessHtmlForTiptap = (html: string): string => {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        img.setAttribute('data-tiptap-image', 'true');
      }
    });
    
    console.log("HTML procesado para Tiptap:", tempDiv.innerHTML.substring(0, 100) + "...");
    return tempDiv.innerHTML;
  };

  const checkImagesInContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const images = tempDiv.querySelectorAll('img');
    console.log(`Encontradas ${images.length} imágenes en el contenido:`);
    
    const imagesToLoad = images.length;
    let loadedImages = 0;
    let errorImages = 0;
    
    images.forEach((img, index) => {
      const originalSrc = img.src;
      let normalizedSrc = originalSrc.replace(/\\/g, '/');
      
      console.log(`${index + 1}. src original: ${originalSrc}`);
      
      if (normalizedSrc !== originalSrc) {
        console.log(`   src normalizada: ${normalizedSrc}`);
      }
      
      const testImg = document.createElement('img');
      
      testImg.onload = () => {
        loadedImages++;
        console.log(`✅ Imagen ${index + 1} cargada correctamente (${loadedImages}/${imagesToLoad})`);
      };
      
      testImg.onerror = (e) => {
        errorImages++;
        console.error(`❌ Error al cargar la imagen ${index + 1}:`, e);
        console.error(`   URL problemática: ${testImg.src}`);
        
        try {
          const urlStr = testImg.src;
          if (urlStr.includes('http://localhost:4000http://')) {
            const fixedUrl = urlStr.replace('http://localhost:4000http://', 'http://');
            console.log(`   - URL corregida: ${fixedUrl}`);
            
            const fixImg = new Image();
            fixImg.onload = () => console.log(`   ✅ La imagen carga correctamente con la URL corregida`);
            fixImg.onerror = () => console.log(`   ❌ La imagen sigue sin cargar con la URL corregida`);
            fixImg.src = fixedUrl;
          } else {
            const urlObj = new URL(urlStr);
            console.log(`   - Protocolo: ${urlObj.protocol}`);
            console.log(`   - Host: ${urlObj.host}`);
            console.log(`   - Pathname: ${urlObj.pathname}`);
          }
        } catch (urlError) {
          console.error(`   - No se pudo analizar la URL: ${urlError.message}`);
          
          const badUrl = testImg.src;
          if (badUrl.includes('localhost:4000') && badUrl.includes('/uploads/')) {
            const parts = badUrl.split('/uploads/');
            if (parts.length > 1) {
              const correctedUrl = `${window.location.origin}/uploads/${parts[parts.length - 1]}`;
              console.log(`   - Intento de corrección: ${correctedUrl}`);
            }
          }
        }
      };
      
      testImg.src = normalizedSrc;
    });
  };

  useEffect(() => {
    const loadPost = async () => {
      if (id) {
        setLoading(true);
        try {
          const post = await blogService.getPostById(Number(id));
          if (post) {
            console.log("Post cargado:", post.title);
            console.log("Contenido HTML recibido:", post.content ? post.content.length : 0, "caracteres");
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.content || '';
            const images = tempDiv.querySelectorAll('img');
            console.log("Imágenes encontradas en el HTML:", images.length);
            
            images.forEach((img, index) => {
              console.log(`Imagen ${index + 1}:`, img.src.substring(0, 50) + "...");
            });
            
            const processedContent = preprocessHtmlForTiptap(post.content || '');
            
            setFormData({
              title: post.title || '',
              slug: post.slug || '',
              excerpt: post.excerpt || '',
              content: processedContent,
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const normalizeContentImageUrls = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const images = tempDiv.querySelectorAll('img');
    let modified = false;
    
    images.forEach(img => {
      const originalSrc = img.getAttribute('src') || '';
      
      if (originalSrc.includes('\\')) {
        const normalizedSrc = originalSrc.replace(/\\/g, '/');
        img.setAttribute('src', normalizedSrc);
        modified = true;
        console.log(`URL de imagen normalizada: ${originalSrc} -> ${normalizedSrc}`);
      }
    });
    
    return modified ? tempDiv.innerHTML : html;
  };

  const normalizeAndTrackImages = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const images = tempDiv.querySelectorAll('img');
    const currentImages = new Set<string>();
    
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src && src.includes('/uploads/')) {
        currentImages.add(src);
      }
      
      if (src.includes('\\')) {
        const normalizedSrc = src.replace(/\\/g, '/');
        img.setAttribute('src', normalizedSrc);
      }
    });
    
    if (trackingImages.size > 0) {
      trackingImages.forEach(oldImageUrl => {
        if (!currentImages.has(oldImageUrl) && oldImageUrl.includes('/uploads/')) {
          console.log('Imagen eliminada del contenido:', oldImageUrl);
          deleteImageFromServer(oldImageUrl);
        }
      });
    }
    
    setTrackingImages(currentImages);
    
    return tempDiv.innerHTML;
  };

  const handleChange = (field: keyof Omit<BlogPost, 'id'>, value: any) => {
    setFormData(prev => {
      let updatedValue = value;
      
      if (field === 'content') {
        updatedValue = normalizeAndTrackImages(value);
      }
      
      const updated = { ...prev, [field]: updatedValue };
      
      if (field === 'title') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const postToSubmit = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
      };

      if (id) {
        await blogService.updatePost({
          ...postToSubmit,
          id: Number(id)
        } as BlogPost);
      } else {
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
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
    }
  };

  const handleContentImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = () => {
      setImageEditorState({
        open: true,
        src: reader.result as string,
        callback: (editedImageUrl) => {
          console.log("Imagen editada con URL:", editedImageUrl);
          
          // No modificar la URL en absoluto, solo usarla tal cual
          if (tiptapRef.current) {
            tiptapRef.current.insertImage(editedImageUrl);
            
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

  const renderImagePreview = () => {
    if (!formData.image) {
      return (
        <div className="flex items-center justify-center h-40 bg-gray-700 rounded-lg border-2 border-dashed border-gray-500">
          <span className="text-gray-400">Sin imagen</span>
        </div>
      );
    }

    return (
      <div className="relative h-40 bg-gray-700 rounded-lg overflow-hidden">
        <SmartImage 
          src={formData.image}
          alt="Vista previa" 
          className="w-full h-full object-cover"
          fallbackSrc="/images/blog/default-post.jpg"
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
  };

  const TestImageComponent = () => {
    const [imagePath, setImagePath] = useState('');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [urlVariants, setUrlVariants] = useState<string[]>([]);
    
    // Añadir URL de prueba automática si existe una URL reciente
    useEffect(() => {
      if (formData.image && formData.image !== '/images/blog/default-post.jpg') {
        setImagePath(formData.image);
      }
    }, [formData.image]);
    
    const testImage = () => {
      if (!imagePath) return;
      
      setTestResult('⏳ Probando acceso a la imagen...');
      
      // Generar variantes de la URL para probar
      const variants: string[] = [imagePath];
      
      // Variante 1: Si es localhost:4000, reemplazar con origen actual
      if (imagePath.includes('localhost:4000')) {
        variants.push(imagePath.replace('http://localhost:4000', window.location.origin));
      }
      
      // Variante 2: Si es relativa, convertir a absoluta
      if (imagePath.startsWith('/')) {
        variants.push(`${window.location.origin}${imagePath}`);
      }
      
      // Variante 3: Si tiene URL doble, extraer la segunda
      if (imagePath.includes('http://') && imagePath.indexOf('http://') !== imagePath.lastIndexOf('http://')) {
        const lastHttpIndex = imagePath.lastIndexOf('http://');
        variants.push(imagePath.substring(lastHttpIndex));
      }
      
      // Variante 4: Para URLs absolutas, extraer la parte relativa
      const uploadsMatch = imagePath.match(/^.*?(\/uploads\/.*?)$/);
      if (uploadsMatch && uploadsMatch[1]) {
        variants.push(uploadsMatch[1]);
        variants.push(`${window.location.origin}${uploadsMatch[1]}`);
      }
      
      setUrlVariants(variants);
      
      // Probar la URL original
      const img = new Image();
      img.onload = () => {
        setTestResult(`✅ La imagen cargó correctamente: ${imagePath}`);
        console.log('Imagen cargada correctamente:', img.width, 'x', img.height);
      };
      
      img.onerror = () => {
        setTestResult(`❌ Error al cargar la imagen: ${imagePath}`);
        console.error('Error al cargar imagen:', imagePath);
      };
      
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
        
        {urlVariants.length > 0 && (
          <div className="mt-4">
            <h4 className="text-white text-sm font-bold mb-2">Variantes de URL probadas:</h4>
            <div className="space-y-2">
              {urlVariants.map((url, index) => (
                <DiagnosticImage key={index} url={url} />
              ))}
            </div>
          </div>
        )}
        
        {imagePath && (
          <div className="mt-2">
            <p className="text-sm text-gray-400 mb-1">Vista previa:</p>
            <SmartImage 
              src={imagePath} 
              alt="Test" 
              className="max-h-32 border border-gray-700 rounded"
            />
          </div>
        )}
      </div>
    );
  };

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

  const handleRemoveFeaturedImage = () => {
    const currentImageUrl = formData.image;
    
    setFormData(prev => ({ ...prev, image: '' }));
    
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

              {showHtml && (
                <div className="mt-2 p-4 bg-gray-800 rounded-lg overflow-auto max-h-60">
                  <pre className="text-xs text-gray-300">{formData.content}</pre>
                </div>
              )}
              
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