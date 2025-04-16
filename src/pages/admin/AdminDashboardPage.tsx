import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import BlogDashboard from '../../components/admin/BlogDashboard';

const AdminDashboardPage: React.FC = () => {
  console.log("Rendering AdminDashboardPage");
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Panel de Administración - GT Ceuta</title>
      </Helmet>
      
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Panel de Administración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estadísticas generales */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Resumen del sitio</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Blog:</span>
                <span className="font-medium">Módulo activo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Patrocinadores:</span>
                <span className="font-medium">Módulo activo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Usuarios:</span>
                <span className="font-medium">1 administrador</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Enlaces rápidos</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/admin/blog/new" 
                className="bg-red-600 hover:bg-red-700 transition p-4 rounded-lg text-center"
              >
                Nuevo artículo
              </Link>
              <Link 
                to="/admin/sponsors" 
                className="bg-blue-600 hover:bg-blue-700 transition p-4 rounded-lg text-center"
              >
                Gestionar patrocinadores
              </Link>
              <Link 
                to="/admin/settings" 
                className="bg-green-600 hover:bg-green-700 transition p-4 rounded-lg text-center"
              >
                Configuración
              </Link>
              <a 
                href="/" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 transition p-4 rounded-lg text-center"
              >
                Ver sitio web
              </a>
            </div>
          </div>
        </div>
        
        {/* Últimas entradas de blog */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Últimas entradas del blog</h2>
          <BlogDashboard showCompactView={true} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;