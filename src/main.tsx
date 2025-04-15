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

// Importar CSS
import './index.css';
import './styles/blog-content.css';
import './styles/quill-dark.css';
import './styles/tiptap.css';
import './styles/blog-card.css'; // Añadir este import

// Componente para gestionar el scroll y el seguimiento de páginas
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    // Log de vista de página para analítica
    logPageView();
  }, [pathname]);
  
  return null;
};

// Función para seguimiento de pageviews para Analytics
const logPageView = () => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: window.location.pathname + window.location.search
    });
  }
};

// Cargar datos iniciales del blog si no hay datos
import blogService from './services/BlogService';
import { initialBlogData } from './data/initialBlogData';

// Cargar datos iniciales del blog si no existen
const loadInitialBlogData = async () => {
  try {
    // Verificar si hay posts en la base de datos
    const posts = await blogService.getAllPosts();
    if (posts.length === 0) {
      console.log('No se encontraron posts, cargando datos iniciales...');
      // Si no hay posts, cargar datos iniciales
      await blogService.importPosts(initialBlogData);
      console.log('Datos iniciales del blog importados con éxito');
    } else {
      console.log(`Base de datos del blog ya contiene ${posts.length} posts`);
    }
  } catch (error) {
    console.error('Error al cargar datos iniciales del blog:', error);
  }
};

// Asegurar que IndexedDB está disponible antes de intentar cargar datos
if ('indexedDB' in window) {
  loadInitialBlogData();
} else {
  console.error('IndexedDB no está disponible en este navegador. El blog no funcionará correctamente.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Declaración para TypeScript sobre gtag
declare global {
  interface Window {
    gtag: (command: string, target: string, params?: any) => void;
  }
}
