import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText as FileTextIcon, 
  Menu as MenuIcon, 
  X as XIcon,
  User as UserIcon,
  UserCog as UserCogIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  togglePdf: () => void;
  toggleMenu?: () => void;
  menuOpen?: boolean;
  isHomePage?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  togglePdf, 
  toggleMenu, 
  menuOpen, 
  isHomePage = false
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  // Enlaces comunes a todas las páginas
  const navLinks = [
    { text: "Inicio", path: "/" },
    { text: "Sobre el Torneo", path: "/sobre-el-torneo" },
    { text: "Bases del torneo", path: "/bases-del-torneo" },
    { text: "Galería", path: "/galeria" },
    { text: "FAQ", path: "/faq" },
    { text: "Blog", path: "/blog" },
    { text: "Colaboradores", path: "/colaboradores" },
    { text: "Contacto", path: "/contacto" },
  ];

  // Renderizar enlace
  const renderLink = (link: {text: string, path: string}) => {
    return (
      <Link 
        to={link.path} 
        className={`hover:text-red-600 transition duration-300 ${isActive(link.path) ? 'text-red-600' : ''}`}
      >
        {link.text}
      </Link>
    );
  };

  // Renderizar enlaces de escritorio
  const renderDesktopLinks = () => (
    <ul className="hidden md:flex items-center space-x-6">
      {navLinks.map((link) => (
        <li key={link.path}>
          {renderLink(link)}
        </li>
      ))}
      <li>
        <button 
          onClick={togglePdf}
          className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
        >
          <FileTextIcon size={16} />
          <span>Ver PDF</span>
        </button>
      </li>
    </ul>
  );

  // Renderizar enlaces móviles
  const renderMobileLinks = () => (
    <ul className="flex flex-col space-y-3">
      {navLinks.map((link) => (
        <li key={link.path}>
          {renderLink(link)}
        </li>
      ))}
      <li>
        <button 
          onClick={() => {
            togglePdf();
            if (toggleMenu) toggleMenu();
          }}
          className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
        >
          <FileTextIcon size={16} />
          <span>Ver PDF</span>
        </button>
      </li>
      <li>
        <Link 
          to={isAuthenticated ? '/admin' : '/login'} 
          className="flex items-center gap-1 text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition duration-300"
          onClick={() => {
            if (toggleMenu) toggleMenu();
          }}
        >
          {isAuthenticated ? <UserCogIcon size={16} /> : <UserIcon size={16} />}
          <span>{isAuthenticated ? 'Panel Admin' : 'Iniciar sesión'}</span>
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo centrado para móviles, a la izquierda para desktop */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Logo GT Ceuta" 
              className="h-12 w-auto"
            />
          </Link>
        </div>
        
        {/* Botón de menú móvil */}
        {toggleMenu && (
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        )}
        
        {/* Links de escritorio centrados */}
        <div className="hidden md:flex justify-center flex-grow">
          {renderDesktopLinks()}
        </div>
        
        {/* Botón de admin/login a la derecha (solo en escritorio) */}
        <div className="hidden md:flex">
          <Link 
            to={isAuthenticated ? '/admin' : '/login'}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
            title={isAuthenticated ? 'Panel de administración' : 'Iniciar sesión'}
            aria-label={isAuthenticated ? 'Panel de administración' : 'Iniciar sesión'}
          >
            {isAuthenticated ? 
              <UserCogIcon size={22} /> : 
              <UserIcon size={22} />
            }
          </Link>
        </div>
      </div>
      
      {/* Menú móvil expandido */}
      {toggleMenu && menuOpen && (
        <div className="md:hidden mt-4 bg-gray-800 rounded-lg p-4">
          {renderMobileLinks()}
        </div>
      )}
    </>
  );
};

export default Navigation;