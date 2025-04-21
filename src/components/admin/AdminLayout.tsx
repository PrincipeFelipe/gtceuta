import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Heart,
  Image
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Menú de navegación
  const navItems = [
    { title: 'Dashboard', icon: <LayoutDashboard className="mr-3" size={20} />, path: '/admin' },
    { title: 'Blog', icon: <FileText className="mr-3" size={20} />, path: '/admin/blog' },
    { title: 'Patrocinadores', icon: <Heart className="mr-3" size={20} />, path: '/admin/sponsors' },
    { title: 'Imágenes', icon: <Image className="mr-3" size={20} />, path: '/admin/images' },
    { title: 'Usuarios', icon: <Users className="mr-3" size={20} />, path: '/admin/users' },
    { title: 'Configuración', icon: <Settings className="mr-3" size={20} />, path: '/admin/settings' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar para móviles */}
      <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-0
      `}>
        {/* Logo y botón cerrar */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="GT Ceuta" className="h-8" />
            <span className="text-xl font-semibold">Admin Panel</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Menú de navegación */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition ${
                    pathname === item.path || pathname.startsWith(`${item.path}/`)
                      ? 'bg-red-700 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-4 sticky top-0 z-30">
          <div className="flex-1 flex">
            {/* Botón menú móvil */}
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden mr-4 text-gray-300 hover:text-white transition"
            >
              <Menu size={24} />
            </button>
            
            {/* Título de la página actual */}
            <h1 className="text-xl font-semibold hidden sm:block">
              {navItems.find(item => pathname === item.path || pathname.startsWith(`${item.path}/`))?.title || 'Admin'}
            </h1>
          </div>
          
          {/* Perfil de usuario */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-700 px-3 py-2 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <span className="hidden sm:block">{user?.username || 'Usuario'}</span>
              <ChevronDown size={16} />
            </button>
            
            {/* Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition"
                  >
                    <LogOut size={18} className="mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Contenido */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} GT Ceuta. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;