import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import SobreElTorneoPage from './pages/SobreElTorneoPage';
import ReglasPage from './pages/ReglasPage';
import FaqPage from './pages/FaqPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import Colaboradores from './pages/Colaboradores';
import ContactoPage from './pages/ContactoPage';
import NotFoundPage from './pages/NotFoundPage';
import GaleriaPage from './pages/GaleriaPage';
import InscripcionPage from './pages/InscripcionPage';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Importar componentes de administración
import BlogAdmin from './components/admin/BlogAdmin';
import BlogForm from './components/admin/BlogForm';
import AdminSettings from './components/admin/AdminSettings';
import BlogDashboard from './components/admin/BlogDashboard';
import BlogImportExport from './components/admin/BlogImportExport';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Añadir estas importaciones:
import AdminSponsorsPage from './pages/admin/AdminSponsorsPage';
import ErrorBoundary from './components/ErrorBoundary';

// Importar CSS
import './index.css';
import './styles/blog-content.css';
import './styles/quill-dark.css';
import './styles/tiptap.css';
import './styles/blog-card.css'; // Añadir este import

import blogService from './services/BlogService'; // Importar correctamente
import SponsorsService from './services/SponsorsService';

// Componente para gestionar el scroll y el seguimiento de páginas
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Ajustar la función de inicialización de datos
const initializeData = async () => {
  try {
    console.log('Iniciando carga de datos por defecto...');
    
    if (typeof blogService.initializeDefaultPosts === 'function') {
      console.log('Inicializando posts de blog...');
      await blogService.initializeDefaultPosts();
      console.log('Posts inicializados correctamente');
    } else {
      console.warn('blogService.initializeDefaultPosts no es una función');
    }

    if (typeof SponsorsService.initializeDefaultSponsors === 'function') {
      console.log('Inicializando patrocinadores...');
      await SponsorsService.initializeDefaultSponsors();
      console.log('Patrocinadores inicializados correctamente');
    } else {
      console.warn('SponsorsService.initializeDefaultSponsors no es una función');
    }
    
    console.log('Datos inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
};

// Llama a la función para inicializar datos
initializeData().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<App />} />
              <Route path="/sobre-el-torneo" element={<SobreElTorneoPage />} />
              <Route path="/bases-del-torneo" element={<ReglasPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/colaboradores" element={<Colaboradores />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/galeria" element={<GaleriaPage />} />
              <Route path="/inscripcion" element={<InscripcionPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Rutas protegidas - Admin */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<BlogDashboard />} />
                <Route path="/admin/blog" element={<BlogAdmin />} />
                <Route path="/admin/blog/new" element={<BlogForm />} />
                <Route path="/admin/blog/edit/:id" element={<BlogForm />} />
                <Route path="/admin/blog/import-export" element={<BlogImportExport />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/sponsors" element={<AdminSponsorsPage />} />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Declaración para TypeScript sobre gtag
declare global {
  interface Window {
    gtag: (command: string, target: string, params?: any) => void;
  }
}
