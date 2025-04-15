import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout as LayoutIcon, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  BarChart3,
  UploadCloud,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Barra superior */}
      <header className="bg-gray-800 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-xl font-bold text-red-600 flex items-center">
            <LayoutIcon className="mr-2" />
            <span>Admin GT Ceuta</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-sm text-gray-300 hover:text-white">
            Ver Sitio
          </Link>
          
          {/* Menú de usuario */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg p-2 transition-colors focus:outline-none"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="text-sm hidden md:block">{user?.name || 'Usuario'}</span>
              <User size={18} />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg p-2 z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1 bg-gray-700 px-2 py-1 rounded inline-block">
                    {user?.role === 'admin' ? 'Administrador' : 
                     user?.role === 'editor' ? 'Editor' : 'Usuario'}
                  </p>
                </div>
                <div className="mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      
      <div className="flex">
        {/* Menú lateral */}
        <aside className={`
          ${mobileMenuOpen ? 'block' : 'hidden'} 
          lg:block fixed lg:sticky top-0 lg:top-[73px] z-10 
          w-64 h-screen lg:h-[calc(100vh-73px)] bg-gray-800 pt-6 px-4 overflow-y-auto
        `}>
          <nav className="space-y-6">
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">
                Blog
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin"
                    className={`flex items-center p-2 rounded-lg ${isActive('/admin') && !isActive('/admin/blog') && !isActive('/admin/settings') ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <BarChart3 size={18} className="mr-3" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/blog"
                    className={`flex items-center p-2 rounded-lg ${isActive('/admin/blog') ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <FileText size={18} className="mr-3" />
                    <span>Gestionar Posts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/blog/import-export"
                    className={`flex items-center p-2 rounded-lg ${isActive('/admin/blog/import-export') ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <UploadCloud size={18} className="mr-3" />
                    <span>Importar/Exportar</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">
                Configuración
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin/settings"
                    className={`flex items-center p-2 rounded-lg ${isActive('/admin/settings') ? 'bg-gray-700 text-red-500' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <Settings size={18} className="mr-3" />
                    <span>Ajustes</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              Panel de administración
              <br />
              GT Ceuta - Warhammer 40k
            </p>
          </div>
        </aside>
        
        {/* Contenido principal */}
        <main className="flex-1 p-6 lg:pl-6" onClick={() => setUserMenuOpen(false)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;