import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import blogService, { BlogPost } from '../../services/BlogService';
import { Save, X, Image, Calendar, Eye, Code } from 'lucide-react';
import AdminLayout from './AdminLayout';
import ImageEditor from './ImageEditor';

// Importamos TiptapEditor y su tipo de referencia
import TiptapEditor, { TiptapEditorRef } from './TiptapEditor';
import '../../styles/tiptap.css';

// Categorías disponibles
const categories = [
  { id: 'guias', name: 'Guías y tutoriales' },
  { id: 'torneos', name: 'Torneos' },
  { id: 'ceuta', name: 'Ceuta' },
  { id: 'estrategia', name: 'Estrategia' }
];

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
              date: post.date || new Date().toISOString().split('T')[0],
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

  // Manejar cambios en los campos del formulario
  const handleChange = (field: keyof Omit<BlogPost, 'id'>, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
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
      if (id) {
        // Modo edición
        await blogService.updatePost({
          ...formData,
          id: Number(id)
        } as BlogPost);
      } else {
        // Modo creación
        await blogService.addPost(formData);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError('Error al guardar el post');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Manejar subida de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convertir la imagen a base64 para almacenarla
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Modificar el manejador de imágenes para el contenido
  const handleContentImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageEditorState({
        open: true,
        src: reader.result as string,
        callback: (editedImageUrl) => {
          // Usar la referencia para insertar la imagen editada
          if (tiptapRef.current) {
            tiptapRef.current.insertImage(editedImageUrl);
          }
          
          setImageEditorState({
            open: false,
            src: null,
            callback: null
          });
        }
      });
    };
    reader.readAsDataURL(file);
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
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Vista previa"
                    className="h-20 w-32 object-cover rounded border border-gray-600"
                  />
                )}
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
                onChange={(content) => handleChange('content', content)}
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