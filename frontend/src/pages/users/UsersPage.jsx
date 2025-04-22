import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import { Helmet } from 'react-helmet-async';

// Iconos - Mantenemos los iconos de Material-UI por consistencia
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  SupervisorAccount as AdminIcon,
  People as UserIcon,
  Edit as EditRoleIcon,
  Visibility as ViewIcon,
  KeyboardArrowLeft as ChevronLeftIcon,
  KeyboardArrowRight as ChevronRightIcon
} from '@mui/icons-material';

const UsersPage = () => {
  const navigate = useNavigate();
  
  // Estados
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/');
        
        // Asegurar que los datos sean un array
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          setUsers(response.data.results);
        } else {
          console.error('Formato de respuesta inesperado:', response.data);
          setUsers([]);
          setError('Error en el formato de datos recibidos del servidor');
        }
      } catch (err) {
        setError('Error al cargar los usuarios. Por favor, inténtalo de nuevo.');
        console.error('Error al cargar los usuarios:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.id}/`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
      console.error('Error al eliminar el usuario:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Número total de páginas
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Estadísticas de usuarios
  const adminCount = users.filter(u => u.role === 'admin').length;
  const editorCount = users.filter(u => u.role === 'editor').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      default:
        return 'Usuario';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Administrar Usuarios - GT Ceuta</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header con título y botón de crear nuevo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Administrar Usuarios</h1>
          <button
            onClick={() => navigate('/users/create')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition mt-4 sm:mt-0"
          >
            <AddIcon fontSize="small" />
            <span className="hidden sm:inline">Nuevo Usuario</span>
          </button>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Tarjeta de Administradores */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:transform hover:-translate-y-1 transition-transform duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-300 font-medium">Administradores</h3>
              <div className="bg-red-500/20 p-2 rounded-full">
                <AdminIcon className="text-red-500" fontSize="small" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-500">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
              ) : (
                adminCount
              )}
            </div>
          </div>

          {/* Tarjeta de Editores */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:transform hover:-translate-y-1 transition-transform duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-300 font-medium">Editores</h3>
              <div className="bg-yellow-500/20 p-2 rounded-full">
                <EditRoleIcon className="text-yellow-500" fontSize="small" />
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500"></div>
              ) : (
                editorCount
              )}
            </div>
          </div>

          {/* Tarjeta de Usuarios */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:transform hover:-translate-y-1 transition-transform duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-300 font-medium">Usuarios</h3>
              <div className="bg-blue-500/20 p-2 rounded-full">
                <UserIcon className="text-blue-500" fontSize="small" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              ) : (
                userCount
              )}
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Mensaje de error si existe */}
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto rounded-lg shadow">
          {loading ? (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-300">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <UserIcon className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <p className="text-xl text-gray-300 mb-4">
                No hay usuarios para mostrar.
                {searchTerm && " Prueba con otra búsqueda o "}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-red-500 hover:underline"
                >
                  limpiar filtros
                </button>
              ) : (
                <button
                  onClick={() => navigate('/users/create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
                >
                  <AddIcon fontSize="small" />
                  Nuevo usuario
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left text-white font-medium">Usuario</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-white font-medium">Rol</th>
                    <th className="px-4 py-3 text-center text-white font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-white font-medium">{user.username}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Editar usuario"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Eliminar usuario"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                          <button
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Ver detalles"
                          >
                            <ViewIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-gray-800 px-4 py-3 border-t border-gray-700">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <ChevronLeftIcon fontSize="small" className="mr-1" />
                    Anterior
                  </button>
                  
                  <div className="text-gray-300">
                    Página {currentPage} de {totalPages}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    Siguiente
                    <ChevronRightIcon fontSize="small" className="ml-1" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Diálogo de eliminación */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Eliminar Usuario</h2>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar al usuario <span className="font-semibold">{userToDelete?.username}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersPage;