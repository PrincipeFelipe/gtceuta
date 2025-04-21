import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import blogService, { BlogPost } from "../../services/BlogService";
import { useAuth } from "../../contexts/AuthContext";
import SmartImage from "../ui/SmartImage";

// Reemplazar ReactQuill por TipTap
import Tiptap, { TiptapEditorRef } from "../common/Tiptap";
// Importar estilos necesarios
import '../../styles/tiptap.css';

// Tipos para el formulario
type FormStatus = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

const BlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Cambiar el tipo de referencia para adaptarse a TipTap
  const editorRef = useRef<TiptapEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para el formulario
  const [post, setPost] = useState<BlogPost>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    tags: "",
    published: false,
    featured: false,
    meta_description: ""
  });
  
  const [status, setStatus] = useState<FormStatus>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<File | null>(null);
  const [contentImages, setContentImages] = useState<File[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  
  // Efecto para cargar el post si estamos en modo edición
  useEffect(() => {
    if (id) {
      loadPost(parseInt(id));
    } else {
      // Si es un nuevo post, asignar fecha actual
      setPost(prev => ({ 
        ...prev, 
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [id]);
  
  // Cargar post existente
  const loadPost = async (postId: number) => {
    try {
      setStatus('loading');
      const data = await blogService.getPostById(postId);
      setPost(data);
      
      // Si hay una imagen, establecer la vista previa
      if (data.image_url) {
        setImagePreview(data.image_url);
      } else if (typeof data.image === 'string') {
        setImagePreview(data.image);
      }
      
      setStatus('idle');
    } catch (error) {
      console.error("Error al cargar el post:", error);
      toast.error("Error al cargar el post");
      setStatus('error');
    }
  };
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Manejar checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPost(prev => ({ ...prev, [name]: checked }));
    } else {
      setPost(prev => ({ ...prev, [name]: value }));
    }
    
    setIsDirty(true);
  };
  
  // Manejar cambios en el editor de contenido - Memoizado para evitar recreaciones
  const handleContentChange = useCallback((content: string) => {
    setPost(prev => {
      // Solo actualizar si el contenido realmente cambió
      if (prev.content === content) return prev;
      
      // Marcar como sucio solo si realmente cambió
      if (!isDirty) setIsDirty(true);
      
      // Devolver el nuevo estado
      return { ...prev, content };
    });
  }, [isDirty]);
  
  // Generar slug automáticamente desde el título
  const generateSlug = () => {
    if (!post.title) return;
    
    const slug = post.title
      .toLowerCase()
      .replace(/[áàäâãåā]/g, 'a')
      .replace(/[éèëêēė]/g, 'e')
      .replace(/[íìïîī]/g, 'i')
      .replace(/[óòöôõō]/g, 'o')
      .replace(/[úùüûū]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[çc]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setPost(prev => ({ ...prev, slug }));
  };
  
  // Efecto para generar slug cuando cambia el título
  useEffect(() => {
    if (!post.slug || post.slug === '') {
      generateSlug();
    }
  }, [post.title]);
  
  // Manejar selección de imagen principal
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setLocalImage(file);
      setIsDirty(true);
    }
  };
  
  // Eliminar imagen principal
  const handleRemoveImage = () => {
    setImagePreview(null);
    setLocalImage(null);
    setPost(prev => ({ ...prev, image: null }));
    setIsDirty(true);
  };
  
  // Función para subir una imagen al servidor y obtener la URL
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      return await blogService.uploadContentImage(id ? parseInt(id) : null, file);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error("Error al subir imagen");
      throw error;
    }
  };
  
  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setStatus('submitting');
      
      // Validación básica
      if (!post.title) {
        toast.error("El título es obligatorio");
        setStatus('idle');
        return;
      }
      
      // Preparar datos del post
      const postData: BlogPost = { ...post };
      
      // Si hay una imagen local, adjuntarla
      if (localImage) {
        postData.image = localImage;
      }
      
      if (contentImages.length > 0) {
        postData.content_images = contentImages;
      }
      
      // Si el usuario actual no está en el post, añadirlo
      if (!postData.author && user?.id) {
        postData.author = user.id;
      }
      
      let savedPost;
      
      if (id) {
        // Actualizar post existente
        savedPost = await blogService.updatePost(postData);
        toast.success("Post actualizado correctamente");
      } else {
        // Crear nuevo post
        savedPost = await blogService.addPost(postData);
        toast.success("Post creado correctamente");
      }
      
      setStatus('success');
      setIsDirty(false);
      
      // Redirigir a la edición si es un post nuevo
      if (!id && savedPost.id) {
        navigate(`/admin/blog/edit/${savedPost.id}`, { replace: true });
      }
    } catch (error) {
      console.error("Error al guardar el post:", error);
      toast.error("Error al guardar el post");
      setStatus('error');
    }
  };
  
  // Verificar cambios antes de salir
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>{id ? 'Editar Post' : 'Nuevo Post'} - GT Ceuta Admin</title>
        </Helmet>
        
        <Toaster position="top-right" />
        
        {/* Cabecera con título y botones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/blog')}
              className="mr-4 p-2 text-gray-300 hover:text-white transition-colors"
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-white">{id ? 'Editar Post' : 'Nuevo Post'}</h1>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                status === 'submitting' 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {status === 'submitting' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Datos principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Título del post"
                />
              </div>
              
              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                  Slug / URL <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={post.slug}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                    placeholder="url-amigable"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="ml-2 px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                    title="Generar desde título"
                  >
                    Generar
                  </button>
                </div>
              </div>
              
              {/* Extracto */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
                  Extracto
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Breve resumen del post (se mostrará en listados)"
                />
              </div>
              
              {/* Contenido - Reemplazado ReactQuill por TipTap */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido <span className="text-red-500">*</span>
                </label>
                <div className="rounded-lg text-white">
                  <Tiptap
                    ref={editorRef}
                    value={post.content}
                    onChange={handleContentChange}
                    placeholder="Escribe aquí el contenido del post..."
                    autofocus={false}
                    uploadImage={uploadImageToServer}
                    // Asegurar un id único para evitar problemas de renderizado
                    key={`editor-${id || 'new'}-${Date.now()}`}
                  />
                </div>
              </div>
              
              {/* Meta descripción */}
              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Descripción (SEO)
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={post.meta_description || ''}
                  onChange={handleChange}
                  rows={2}
                  maxLength={160}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Descripción SEO (máx 160 caracteres)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {(post.meta_description?.length || 0)}/160 caracteres
                </p>
              </div>
            </div>
            
            {/* Columna derecha - Configuración */}
            <div className="space-y-6">
              {/* Imagen principal */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen Principal
                </label>
                {imagePreview ? (
                  <div className="relative bg-gray-700 p-2 rounded-lg">
                    <div className="relative aspect-[16/9] overflow-hidden rounded">
                      <SmartImage 
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full aspect-[16/9] cursor-pointer bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-500 transition-colors text-gray-300 hover:text-white">
                    <div className="flex flex-col items-center justify-center h-full">
                      <ImageIcon size={36} className="mb-2" />
                      <span className="text-sm">Haz clic para subir una imagen</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (máx 2MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* El resto del formulario sigue igual */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={post.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                />
              </div>
              
              {/* Categoría */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={post.category || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Categoría"
                />
              </div>
              
              {/* Etiquetas */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                  Etiquetas
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={post.tags || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Separadas por comas"
                />
              </div>
              
              {/* Opciones */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={post.published || false}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600"
                  />
                  <label htmlFor="published" className="ml-2 text-sm text-gray-300">
                    Publicar post
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={post.featured || false}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                    Destacar post
                  </label>
                </div>
              </div>
              
              {/* Información adicional */}
              {id && post.last_modified && (
                <div className="pt-4 text-xs text-gray-400">
                  <p>Última modificación: {new Date(post.last_modified).toLocaleString()}</p>
                  {post.author_name && (
                    <p>Autor: {post.author_name}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BlogForm;