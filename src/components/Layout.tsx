import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PdfViewer from './PdfViewer';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showPdf, setShowPdf] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const togglePdf = () => {
    setShowPdf(!showPdf);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Barra de navegación principal */}
      <nav className="bg-gray-900 bg-opacity-95 py-4 px-6 sticky top-0 z-40 shadow-md">
        <Navigation 
          togglePdf={togglePdf}
          toggleMenu={toggleMenu}
          menuOpen={menuOpen}
        />
      </nav>
      
      {/* Contenido principal */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-lg">I GT de Ceuta - Torneo oficial de Warhammer 40.000</p>
              <p className="text-gray-400">28 y 29 de junio de 2025 - Gran Torneo de Warhammer 40k</p>
              <p>Organizado por Kubos Ludika y Megaverse</p>
              <p className="text-sm text-gray-400">© 2025 GT Ceuta. Todos los derechos reservados.</p>
            </div>
            <div className="flex flex-col">
              <p className="mb-2 font-bold">Síguenos</p>
              <div className="flex justify-center gap-4">
                <a href="https://www.instagram.com/gtceuta" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition duration-300" aria-label="Instagram">Instagram</a>
                <a href="https://x.com/gtceuta" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition duration-300" aria-label="Twitter">X</a>
                <a href="https://www.facebook.com/gtceuta" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition duration-300" aria-label="Facebook">Facebook</a>
              </div>
            </div>
          </div>
          <nav className="mt-8">
            <ul className="flex flex-wrap justify-center gap-4">
              <li><Link to="/" className="hover:text-red-600 transition duration-300">Inicio</Link></li>
              <li><Link to="/sobre-el-torneo" className="hover:text-red-600 transition duration-300">Sobre el Torneo</Link></li>
              <li><Link to="/reglas" className="hover:text-red-600 transition duration-300">Reglas</Link></li>
              <li><Link to="/blog" className="hover:text-red-600 transition duration-300">Blog</Link></li>
              <li><Link to="/faq" className="hover:text-red-600 transition duration-300">FAQ</Link></li>
              <li><Link to="/contacto" className="hover:text-red-600 transition duration-300">Contacto</Link></li>
              <li><button onClick={togglePdf} className="hover:text-red-600 transition duration-300">Bases</button></li>
            </ul>
          </nav>
          <p className="text-center mt-8 text-sm text-gray-400">
            Warhammer 40,000 y todos los logos relacionados son marcas registradas de Games Workshop Limited. Este evento no está afiliado oficialmente con Games Workshop Ltd.
          </p>
        </div>
      </footer>
      
      {/* PDF Viewer Modal */}
      {showPdf && (
        <PdfViewer 
          pdfUrl="/documents/Bases GT Ceuta.pdf" 
          onClose={togglePdf} 
        />
      )}
    </div>
  );
};

export default Layout;