import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../services/BlogService';
import { formatDate } from '../../utils/dateUtils';
import { normalizeImageUrl } from '../../utils/imageUtils';
import '../../styles/admin/BlogTable.css';
import ImageThumbnail from '../ui/ImageThumbnail';

interface BlogTableProps {
  posts: BlogPost[];
  onDelete: (id: number) => void;
}

const BlogTable: React.FC<BlogTableProps> = ({ posts, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Imagen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Título</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {posts.map(post => (
            <tr key={post.id} className="hover:bg-gray-800 transition-colors">
              <td className="px-2 py-2 whitespace-nowrap">
                <div className="h-12 w-16 bg-gray-800 rounded overflow-hidden">
                  {post.image ? (
                    <ImageThumbnail 
                      src={post.image} 
                      alt={post.title}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500 text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-100">{post.title}</span>
                  <span className="text-xs text-gray-400">{post.slug}</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(post.date)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  post.published ? 'bg-green-800 text-green-100' : 'bg-yellow-800 text-yellow-100'
                }`}>
                  {post.published ? 'Publicado' : 'Borrador'}
                </span>
                {post.featured && (
                  <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-800 text-purple-100">
                    Destacado
                  </span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link 
                    to={`/admin/blog/edit/${post.id}`} 
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Editar
                  </Link>
                  <Link 
                    to={`/blog/${post.slug}`} 
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => onDelete(post.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogTable;