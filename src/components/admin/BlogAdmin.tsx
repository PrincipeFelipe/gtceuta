import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Plus, Download, Upload, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from './AdminLayout';
import blogService, { BlogPost } from '../../services/BlogService';
import SmartImage from '../ui/SmartImage';
import { toast, Toaster } from 'react-hot-toast';
import ConfirmDialog from '../common/ConfirmDialog';

const BlogAdmin: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [postsPerPage] = useState<number>(10);
  
  // Estado para diálogo de confirmación
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  
  // Cargar posts
  useEffect(() => {
    loadPosts();
  }, []);
  
  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error al cargar posts:', error);
      toast.error('Error al cargar los posts');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar posts según término de búsqueda
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginación
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  
  // Número total de páginas
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // Manejar la exportación de datos
  const handleExport = async () => {
    try {
      // Obtener todos los posts
      const allPosts = await blogService.getAllPosts();
      
      // Convertir a JSON y crear blob
      const jsonData = JSON.stringify(allPosts, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Crear URL para descargar
      const url = URL.createObjectURL(blob);
      
      // Crear elemento anchor y simular clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `gt-ceuta-blog-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpieza
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`${allPosts.length} posts exportados correctamente`);
    } catch (error) {
      console.error('Error al exportar posts:', error);
      toast.error('Error al exportar los posts');
    }
  };
  
  // Manejar la importación de datos
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          toast.error('Error al leer el archivo');
          return;
        }
        
        const postsData = JSON.parse(event.target.result);
        
        if (!Array.isArray(postsData)) {
          toast.error('Formato de archivo inválido');
          return;
        }
        
        let imported = 0;
        let errors = 0;
        
        for (const post of postsData) {
          try {
            // Si el post tiene ID, intentar actualizar
            if (post.id) {
              await blogService.updatePost(post);
            } else {
              // Si no tiene ID, crear nuevo
              const { id, ...postData } = post;
              await blogService.addPost(postData);
            }
            imported++;
          } catch (err) {
            console.error(`Error al importar post "${post.title}":`, err);
            errors++;
          }
        }
        
        await loadPosts();
        
        if (errors > 0) {
          toast.warning(`Importación completada: ${imported} posts importados, ${errors} errores`);
        } else {
          toast.success(`${imported} posts importados correctamente`);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error al importar posts:', error);
      toast.error('Error al importar los posts. Verifica el formato del archivo.');
    } finally {
      e.target.value = ''; // Resetear input para permitir seleccionar el mismo archivo
    }
  };
  
  // Manejar eliminación de post
  const handleDelete = (postId: number) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };
  
  // Confirmar eliminación de post
  const confirmDelete = async () => {
    if (postToDelete === null) return;
    
    try {
      await blogService.deletePost(postToDelete);
      setPosts(prev => prev.filter(post => post.id !== postToDelete));
      toast.success('Post eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar post:', error);
      toast.error('Error al eliminar el post');
    } finally {
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Obtener la URL de la imagen (ya sea image o image_url)
  const getImageUrl = (post: BlogPost): string | null => {
    if (post.image_url) {
      return post.image_url;
    } else if (typeof post.image === 'string') {
      return post.image;
    }
    return null;
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Administrar Blog - GT Ceuta</title>
        </Helmet>
        
        <Toaster position="top-right" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Administrar Blog</h1>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => navigate('/admin/blog/new')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              title="Crear nuevo post"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Post</span>
            </button>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              title="Exportar todos los posts"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            
            <label className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition cursor-pointer">
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Tabla de posts */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-300">Cargando posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-xl text-gray-300 mb-4">
              No hay posts para mostrar.
              {searchTerm && " Prueba con otra búsqueda o "}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="text-red-500 hover:underline"
              >
                limpiar filtros
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/blog/new')}
                className="inline-flex items-center text-red-500 hover:underline"
              >
                <Plus size={16} className="mr-1" />
                Crear tu primer post
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left text-white font-medium">Título</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Fecha</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Estado</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Categoría</th>
                    <th className="px-4 py-3 text-center text-white font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-12 w-16 bg-gray-900 rounded overflow-hidden mr-3 relative">
                            <SmartImage 
                              src={getImageUrl(post)} 
                              alt={post.title}
                              className="h-full w-full object-cover"
                              containerClassName="h-full w-full"
                              fallbackSrc="/images/blog/default-post.jpg"
                            />
                          </div>
                          <span className="font-medium text-white">{post.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{formatDate(post.date)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {post.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {post.category || 'Sin categoría'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Ver post"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Editar post"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Eliminar post"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Anterior
                </button>
                
                <div className="text-gray-300">
                  Página {currentPage} de {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Siguiente
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Eliminar Post"
        description="¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer y se eliminarán todas las imágenes asociadas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </AdminLayout>
  );
};

export default BlogAdmin;