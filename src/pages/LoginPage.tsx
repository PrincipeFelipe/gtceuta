import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, User, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor introduce nombre de usuario y contraseña');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log("Intentando login desde formulario...");
      const success = await login(username, password);
      
      if (!success) {
        setError('Nombre de usuario o contraseña incorrectos');
      } else {
        // La redirección se maneja en el useEffect
        console.log("Login exitoso, debería redireccionar pronto...");
      }
    } catch (err) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Helmet>
        <title>Iniciar Sesión - Panel de Administración | GT Ceuta</title>
      </Helmet>
      
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        <div className="px-8 py-10">
          <div className="text-center mb-8">
            <img 
              src="/images/logo.png" 
              alt="GT Ceuta Logo" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
            <p className="text-gray-400 mt-1">Accede al panel de administración</p>
          </div>
          
          {error && (
            <div className="bg-red-600/20 border border-red-800 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-1" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={18} className="text-gray-500" />
                </div>
                <input 
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Nombre de usuario"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Contraseña"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200 flex justify-center items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="text-gray-400 hover:text-white transition"
            >
              Volver a la página principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;