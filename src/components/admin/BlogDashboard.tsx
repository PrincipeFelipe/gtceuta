import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import blogService, { BlogPost } from '../../services/BlogService';
import { BarChart, FileText, Edit, PlusSquare } from 'lucide-react';

const BlogDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    categories: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allPosts = await blogService.getAllPosts();
        setPosts(allPosts);
        
        // Calcular estadísticas
        const publishedPosts = allPosts.filter(post => post.published);
        const draftPosts = allPosts.filter(post => !post.published);
        const categoryCounts = await blogService.countPostsByCategory();
        
        setStats({
          total: allPosts.length,
          published: publishedPosts.length,
          drafts: draftPosts.length,
          categories: categoryCounts
        });
        
        // Obtener los 5 posts más recientes
        const recent = await blogService.getRecentPosts(5);
        setRecentPosts(recent);
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard del Blog</h1>
            <p className="text-gray-400">Resumen y estadísticas del blog</p>
          </div>
          <Link
            to="/admin/blog/new"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <PlusSquare size={18} />
            <span>Crear Nuevo Post</span>
          </Link>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-gray-400">Total de Posts</h3>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText size={36} className="text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-gray-400">Publicados</h3>
                <p className="text-3xl font-bold text-green-500">{stats.published}</p>
              </div>
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-full">
                <FileText size={24} className="text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-gray-400">Borradores</h3>
                <p className="text-3xl font-bold text-yellow-500">{stats.drafts}</p>
              </div>
              <div className="p-3 bg-yellow-500 bg-opacity-20 rounded-full">
                <FileText size={24} className="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por categoría */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <BarChart size={20} className="text-red-500 mr-2" />
              <h3 className="text-xl font-bold text-white">Posts por Categoría</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="flex items-center">
                  <div className="w-36 text-gray-400">{getCategoryName(category)}</div>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-700 h-2 rounded-full w-full">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{width: `${(count / stats.total) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="text-gray-300 font-medium w-8 text-right">{count}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Posts recientes */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Posts Recientes</h3>
              <Link to="/admin/blog" className="text-red-500 hover:text-red-400 text-sm">
                Ver todos
              </Link>
            </div>
            
            <div className="divide-y divide-gray-700">
              {recentPosts.map(post => (
                <div key={post.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{post.title}</h4>
                      <p className="text-gray-400 text-sm">{formatDate(post.date)}</p>
                    </div>
                    <Link to={`/admin/blog/edit/${post.id}`} className="text-blue-400 hover:text-blue-300">
                      <Edit size={18} />
                    </Link>
                  </div>
                </div>
              ))}
              
              {recentPosts.length === 0 && (
                <p className="text-gray-400 py-4">No hay posts recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Función auxiliar para obtener el nombre de la categoría
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    'guias': 'Guías y tutoriales',
    'torneos': 'Torneos',
    'ceuta': 'Ceuta',
    'estrategia': 'Estrategia'
  };
  
  return categories[categoryId] || categoryId;
}

export default BlogDashboard;