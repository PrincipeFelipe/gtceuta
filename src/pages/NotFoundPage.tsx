import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Home, Search, HelpCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Página no encontrada - I GT de Ceuta - Warhammer 40.000</title>
        <meta name="description" content="Lo sentimos, la página que estás buscando no existe o ha sido movida." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="py-32 px-4 bg-black">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 text-red-600">404</h1>
          <h2 className="text-3xl font-bold mb-6 text-white">Página no encontrada</h2>
          <p className="text-xl text-gray-300 mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          
          <div className="space-y-4">
            <p className="text-gray-400">¿Qué puedes hacer ahora?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/" 
                className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300"
              >
                <Home size={24} className="text-red-600 mb-2" />
                <span>Ir al inicio</span>
              </Link>
              
              <Link 
                to="/faq" 
                className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300"
              >
                <HelpCircle size={24} className="text-red-600 mb-2" />
                <span>Ver FAQ</span>
              </Link>
              
              <Link 
                to="/contacto" 
                className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300"
              >
                <Search size={24} className="text-red-600 mb-2" />
                <span>Contactar</span>
              </Link>
            </div>
            
            <div className="mt-8">
              <p className="text-lg text-gray-300 mb-4">Enlaces populares:</p>
              <ul className="space-y-2">
                <li><Link to="/" className="text-red-600 hover:underline">Página principal</Link></li>
                <li><Link to="/inscripcion" className="text-red-600 hover:underline">Inscripción al torneo</Link></li>
                <li><Link to="/reglas" className="text-red-600 hover:underline">Reglas y formato</Link></li>
                <li><Link to="/blog" className="text-red-600 hover:underline">Blog y artículos</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;