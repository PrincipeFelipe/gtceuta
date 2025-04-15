import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import './index.css';

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

// Registrar el service worker para mejorar el rendimiento y habilitar funcionalidades offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Declaración para TypeScript sobre gtag
declare global {
  interface Window {
    gtag: (command: string, target: string, params?: any) => void;
  }
}
