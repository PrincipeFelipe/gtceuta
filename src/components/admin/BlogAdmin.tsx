import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, Plus, Eye, Edit2, Trash2, Calendar, Tag, Download, Upload } from 'lucide-react';
import AdminLayout from './AdminLayout';
import BlogService from '../../services/BlogService';
import { BlogPost } from '../../services/BlogService';
import { Helmet } from 'react-helmet-async';

const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showImportExport, setShowImportExport] = useState(false);
  const navigate = useNavigate();

  // Cargar todos los posts al inicializar
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const allPosts = await BlogService.getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error al cargar los posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filtrar posts basado en el término de búsqueda
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar la eliminación de un post
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.')) {
      try {
        await BlogService.deletePost(id);
        setPosts(posts.filter(post => post.id !== id));
        toast.success('Post eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el post:', error);
        toast.error('Error al eliminar el post');
      }
    }
  };

  // Manejar la exportación de datos
  const handleExport = async () => {
    try {
      // Obtener todos los posts
      const allPosts = await BlogService.getAllPosts();
      
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
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Leer el archivo
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
      
      // Parsear el JSON
      const postsToImport = JSON.parse(fileContent) as BlogPost[];
      
      // Validar la estructura básica
      if (!Array.isArray(postsToImport) || !postsToImport.every(post => 
        typeof post.title === 'string' && 
        typeof post.content === 'string' &&
        typeof post.slug === 'string'
      )) {
        toast.error('Formato de archivo inválido');
        return;
      }
      
      // Confirmar con el usuario
      if (!window.confirm(`¿Estás seguro de importar ${postsToImport.length} posts? Esta acción podría sobreescribir datos existentes.`)) {
        toast.info('Importación cancelada por el usuario');
        return;
      }
      
      // Importar cada post
      let imported = 0;
      let errors = 0;
      
      for (const post of postsToImport) {
        try {
          // Si el post tiene ID, intentar actualizar
          if (post.id) {
            await BlogService.updatePost(post);
          } else {
            // Si no tiene ID, crear nuevo
            const { id, ...postData } = post as any;
            await BlogService.addPost(postData);
          }
          imported++;
        } catch (err) {
          console.error(`Error al importar post "${post.title}":`, err);
          errors++;
        }
      }
      
      // Recargar posts después de la importación
      const updatedPosts = await BlogService.getAllPosts();
      setPosts(updatedPosts);
      
      if (errors > 0) {
        toast.warning(`Importación completada: ${imported} posts importados, ${errors} errores`);
      } else {
        toast.success(`${imported} posts importados correctamente`);
      }
    } catch (error) {
      console.error('Error al importar posts:', error);
      toast.error('Error al importar los posts. Verifica el formato del archivo.');
    } finally {
      e.target.value = ''; // Resetear input para permitir seleccionar el mismo archivo
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

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Administrar Blog - GT Ceuta</title>
        </Helmet>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Administrar Blog</h1>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => navigate('/admin/blog/new')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} />
              <span>Nuevo Post</span>
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
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-12 w-16 object-cover rounded mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/fallback-image.png';
                            }}
                          />
                        )}
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
                          onClick={() => navigate(`/blog/${post.slug}`)}
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
        )}
      </div>
    </AdminLayout>
  );
};

export default BlogAdmin;