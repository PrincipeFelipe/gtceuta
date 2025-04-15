import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Helmet>
        <title>Acceso no autorizado | GT Ceuta</title>
      </Helmet>
      
      <div className="max-w-md w-full text-center">
        <div className="bg-red-600/20 p-6 rounded-full inline-flex items-center justify-center mb-6">
          <ShieldOff size={64} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Acceso Denegado</h1>
        <p className="text-xl text-gray-400 mb-8">
          No tienes permisos para acceder a esta página
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <Home size={18} />
            <span>Ir al inicio</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            <ArrowLeft size={18} />
            <span>Volver atrás</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;