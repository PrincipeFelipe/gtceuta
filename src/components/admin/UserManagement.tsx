import React, { useState, useEffect } from 'react';
// Modificar esta línea - importación separada para User
import authService from '../../services/AuthService';
import type { User } from '../../services/AuthService';
import { Plus, Trash2, Edit, Check, X, AlertCircle } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'editor' as 'admin' | 'editor' | 'user'
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await authService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await authService.createUser(
        {
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        newUser.password
      );

      if (success) {
        setMessage({
          type: 'success',
          text: 'Usuario creado correctamente'
        });
        
        // Refrescar lista
        const updatedUsers = await authService.getAllUsers();
        setUsers(updatedUsers);
        
        // Resetear formulario
        setNewUser({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'editor'
        });
        setShowAddForm(false);
      } else {
        setMessage({
          type: 'error',
          text: 'No se pudo crear el usuario. El nombre de usuario o email ya existe.'
        });
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setMessage({
        type: 'error',
        text: 'Error al crear usuario. Inténtalo de nuevo.'
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const success = await authService.deleteUser(userId);
      if (success) {
        setUsers(users.filter(user => user.id !== userId));
        setMessage({
          type: 'success',
          text: 'Usuario eliminado correctamente'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'No se pudo eliminar el usuario'
        });
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMessage({
        type: 'error',
        text: 'Error al eliminar el usuario. Inténtalo de nuevo.'
      });
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <User className="mr-2 text-red-500" size={24} />
        <span>Gestión de Usuarios</span>
      </h2>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-600/20 border border-green-800' : 'bg-red-600/20 border border-red-800'}`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <Check size={18} className="mr-2 text-green-500" />
            ) : (
              <AlertCircle size={18} className="mr-2 text-red-500" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-6">
        {showAddForm ? (
          <button
            onClick={() => setShowAddForm(false)}
            className="flex items-center gap-1 text-red-500 hover:text-red-400"
          >
            <X size={16} />
            <span>Cancelar</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} />
            <span>Añadir Usuario</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddUser} className="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4">Crear usuario nuevo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre completo</label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              required
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'editor' | 'user' })}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            >
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="user">Usuario</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="mr-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Rol</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700">
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-red-600/20 text-red-400' :
                    user.role === 'editor' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-400"
                    title="Eliminar usuario"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-400">
                  No hay usuarios para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;