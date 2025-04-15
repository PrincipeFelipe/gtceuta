import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, FileText, Settings, Users, LogOut, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro que quieres cerrar sesión?')) {
      await logout();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <Link to="/admin" className="flex items-center">
            <h1 className="text-xl font-bold">GT Ceuta Admin</h1>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/admin"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
              location.pathname === '/admin'
                ? 'bg-red-600 hover:bg-red-700'
                : ''
            }`}
          >
            <Home size={20} className="mr-3" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            to="/admin/blog"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
              isActive('/admin/blog') ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            <FileText size={20} className="mr-3" />
            <span>Blog</span>
          </Link>
          
          <Link
            to="/admin/sponsors"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
              isActive('/admin/sponsors') ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            <Globe size={20} className="mr-3" />
            <span>Patrocinadores</span>
          </Link>
          
          <Link
            to="/admin/users"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
              isActive('/admin/users') ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            <Users size={20} className="mr-3" />
            <span>Usuarios</span>
          </Link>
          
          <Link
            to="/admin/settings"
            className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
              isActive('/admin/settings') ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            <Settings size={20} className="mr-3" />
            <span>Ajustes</span>
          </Link>
        </nav>

        <div className="pt-4 border-t border-gray-700 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center p-2 rounded-lg text-blue-400 hover:bg-gray-700 hover:text-blue-300"
          >
            <ExternalLink size={20} className="mr-3" />
            <span>Ver sitio web</span>
          </a>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <LogOut size={20} className="mr-3" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* Contenido principal de cada página */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;