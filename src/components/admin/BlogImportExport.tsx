import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import blogService, { BlogPost } from '../../services/BlogService';
import { Download, Upload, RefreshCw, Check, AlertTriangle } from 'lucide-react';

const BlogImportExport: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error' | 'info'} | null>(null);

  // Función para exportar todos los posts a un archivo JSON
  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);
      
      // Obtener todos los posts
      const posts = await blogService.exportPosts();
      
      // Convertir a JSON y crear blob
      const jsonData = JSON.stringify(posts, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Crear URL y link para descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gt-ceuta-blog-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({
        text: `Exportación completada: ${posts.length} posts exportados`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error al exportar posts:', error);
      setMessage({
        text: 'Error al exportar los datos',
        type: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  // Función para importar posts desde un archivo JSON
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImporting(true);
      setMessage(null);
      
      // Leer el archivo
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
      
      // Parsear el JSON
      const posts = JSON.parse(fileContent) as BlogPost[];
      
      // Validar la estructura básica
      if (!Array.isArray(posts) || !posts.every(post => 
        typeof post.title === 'string' && 
        typeof post.content === 'string' &&
        typeof post.slug === 'string'
      )) {
        throw new Error('Formato de archivo inválido');
      }
      
      // Confirmar con el usuario
      if (!window.confirm(`¿Estás seguro de importar ${posts.length} posts? Esta acción podría sobreescribir datos existentes.`)) {
        setMessage({
          text: 'Importación cancelada por el usuario',
          type: 'info'
        });
        setImporting(false);
        return;
      }
      
      // Intentar importar cada post
      let imported = 0;
      let errors = 0;
      
      for (const post of posts) {
        try {
          // Si el post tiene ID, intentar actualizar
          if (post.id) {
            await blogService.updatePost(post);
          } else {
            // Si no tiene ID, crear nuevo
            const { id, ...postData } = post as any;
            await blogService.addPost(postData);
          }
          imported++;
        } catch (err) {
          console.error(`Error al importar post "${post.title}":`, err);
          errors++;
        }
      }
      
      setMessage({
        text: `Importación completada: ${imported} posts importados, ${errors} errores`,
        type: errors > 0 ? 'info' : 'success'
      });
    } catch (error) {
      console.error('Error al importar posts:', error);
      setMessage({
        text: 'Error al importar los datos. Asegúrate de que el formato es correcto.',
        type: 'error'
      });
    } finally {
      setImporting(false);
      e.target.value = ''; // Resetear input para permitir seleccionar el mismo archivo
    }
  };

  // Función para reiniciar la base de datos con datos iniciales
  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de reiniciar la base de datos? Todos los posts actuales serán eliminados y se cargarán los datos iniciales. Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setMessage(null);
      
      // Obtener todos los posts
      const posts = await blogService.getAllPosts();
      
      // Eliminar todos los posts
      for (const post of posts) {
        await blogService.deletePost(post.id);
      }
      
      // Importar datos iniciales
      await blogService.importPosts(await import('../../data/initialBlogData').then(m => m.initialBlogData));
      
      setMessage({
        text: 'Base de datos reiniciada correctamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error al reiniciar la base de datos:', error);
      setMessage({
        text: 'Error al reiniciar la base de datos',
        type: 'error'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Importar/Exportar Blog</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.type === 'success' ? 'bg-green-600' : 
            message.type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? <Check className="mr-2" /> : 
               message.type === 'error' ? <AlertTriangle className="mr-2" /> : 
               <RefreshCw className="mr-2" />}
              <span>{message.text}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel de exportación */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Download size={20} className="mr-2 text-blue-500" />
              Exportar datos
            </h2>
            <p className="text-gray-400 mb-4">
              Exporta todos los posts del blog a un archivo JSON. Útil para respaldos o migración.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download size={18} className="mr-2" />
                  Exportar posts
                </>
              )}
            </button>
          </div>
          
          {/* Panel de importación */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Upload size={20} className="mr-2 text-green-500" />
              Importar datos
            </h2>
            <p className="text-gray-400 mb-4">
              Importa posts desde un archivo JSON previamente exportado.
            </p>
            <label className={`flex items-center justify-center w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Seleccionar archivo JSON
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {/* Panel de reinicio */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <RefreshCw size={20} className="mr-2 text-red-500" />
            Reiniciar base de datos
          </h2>
          <p className="text-gray-400 mb-4">
            Elimina todos los posts y restaura los datos iniciales de muestra. <strong>Esta acción no se puede deshacer.</strong>
          </p>
          <button
            onClick={handleReset}
            className="flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <RefreshCw size={18} className="mr-2" />
            Reiniciar base de datos
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogImportExport;