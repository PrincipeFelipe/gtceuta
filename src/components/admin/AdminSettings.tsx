import React, { useState } from 'react';
import { Save, Trash2, HardDrive, Database } from 'lucide-react';
import UserManagement from './UserManagement';
import { toast } from 'react-toastify';
import BlogService from '../../services/BlogService';
import SponsorsService from '../../services/SponsorsService';

const AdminSettings: React.FC = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'blog' | 'users'>('blog');
  const [isInitializing, setIsInitializing] = useState(false);

  // Función para exportar toda la base de datos
  const handleExportData = async () => {
    setExportLoading(true);
    setMessage(null);
    
    try {
      // Importamos dinámicamente para reducir el tamaño del bundle
      const { getAllPosts } = await import('../../services/BlogService').then(m => ({
        getAllPosts: m.default.getAllPosts
      }));
      
      // Obtener todos los posts
      const allPosts = await getAllPosts();
      
      // Generar el archivo JSON
      const dataStr = JSON.stringify(allPosts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Crear URL para descarga
      const url = URL.createObjectURL(dataBlob);
      
      // Crear elemento anchor y simular clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `gt-ceuta-blog-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpieza
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      setMessage({
        type: 'success',
        text: 'Datos exportados correctamente'
      });
    } catch (error) {
      console.error('Error al exportar datos:', error);
      setMessage({
        type: 'error',
        text: 'Error al exportar datos. Intenta nuevamente.'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Función para importar datos
  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportLoading(true);
    setMessage(null);
    
    try {
      // Leer el contenido del archivo
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      
      // Importar dinámicamente
      const { addPost } = await import('../../services/BlogService').then(m => ({
        addPost: m.default.addPost
      }));
      
      // Importar cada post
      for (const post of jsonData) {
        // Eliminar ID para que se genere uno nuevo
        const { id, ...postData } = post;
        await addPost(postData);
      }
      
      setMessage({
        type: 'success',
        text: `${jsonData.length} posts importados correctamente`
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      setMessage({
        type: 'error',
        text: 'Error al importar datos. Verifica el formato del archivo.'
      });
    } finally {
      setImportLoading(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  // Función para reiniciar la base de datos
  const handleResetDatabase = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar TODOS los posts? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setResetLoading(true);
    setMessage(null);
    
    try {
      // Importar funciones necesarias
      const { default: indexedDB } = await import('idb');
      
      // Eliminar toda la base de datos
      await indexedDB.deleteDB('gt-ceuta-blog-db');
      
      setMessage({
        type: 'success',
        text: 'Base de datos reiniciada. Recarga la página para inicializar una nueva base de datos.'
      });
    } catch (error) {
      console.error('Error al reiniciar la base de datos:', error);
      setMessage({
        type: 'error',
        text: 'Error al reiniciar la base de datos.'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Función para inicializar datos por defecto
  const handleInitializeData = async () => {
    if (!window.confirm('¿Estás seguro de inicializar los datos por defecto? Esta acción solo añadirá datos si no existen.')) return;
    
    setIsInitializing(true);
    try {
      await BlogService.initializeDefaultPosts();
      await SponsorsService.initializeDefaultSponsors();
      toast.success('Datos inicializados correctamente');
    } catch (error) {
      console.error('Error al inicializar datos:', error);
      toast.error('Error al inicializar datos');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Configuración</h1>
      
      <div className="flex border-b border-gray-700 mb-8">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'blog' ? 'border-b-2 border-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('blog')}
        >
          Blog
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
      </div>
      
      {activeTab === 'blog' && (
        <>
          {message && (
            <div className={`mb-8 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
              {message.text}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <HardDrive size={24} className="text-green-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">Exportar datos</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Descarga una copia de seguridad de todos los posts del blog en formato JSON.
                Este archivo se puede utilizar para restaurar los datos o transferirlos a otro sistema.
              </p>
              <button
                onClick={handleExportData}
                disabled={exportLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save size={18} />
                )}
                <span>Exportar datos</span>
              </button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Database size={24} className="text-blue-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">Importar datos</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Importa posts desde un archivo JSON previamente exportado.
                Los posts importados se añadirán a los existentes.
              </p>
              <label className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition cursor-pointer disabled:opacity-50 ${importLoading ? 'opacity-50' : ''}`}>
                {importLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Database size={18} />
                )}
                <span>Importar datos</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={importLoading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Trash2 size={24} className="text-red-500 mr-3" />
              <h2 className="text-2xl font-bold text-white">Reiniciar base de datos</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Esta acción eliminará <strong>TODOS</strong> los posts de la base de datos.
              Esta operación no se puede deshacer, considera hacer una exportación antes.
            </p>
            <button
              onClick={handleResetDatabase}
              disabled={resetLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {resetLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Trash2 size={18} />
              )}
              <span>Reiniciar base de datos</span>
            </button>
          </div>

          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <HardDrive size={24} className="text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-white">Inicializar datos</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Crea entradas de blog y patrocinadores predeterminados si no existen entradas.
            </p>
            <button
              onClick={handleInitializeData}
              disabled={isInitializing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {isInitializing ? 'Inicializando...' : 'Inicializar Datos Predeterminados'}
            </button>
          </div>
        </>
      )}
      
      {activeTab === 'users' && (
        <UserManagement />
      )}
    </div>
  );
};

export default AdminSettings;