import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import UserDeleteDialog from '../../components/users/UserDeleteDialog';

// Material-UI imports para garantizar compatibilidad
import { 
  Typography, 
  Button, 
  Box, 
  Paper, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Badge,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';

// Iconos
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  SupervisorAccount as SupervisorAccountIcon,
  People as PeopleIcon,
  Edit as EditRoleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Estilos personalizados para replicar la apariencia deseada
const styles = {
  container: {
    padding: '24px',
    width: '100%', // Ocupar todo el ancho disponible
  },
  pageHeader: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#FFF',
    marginBottom: '16px',
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#1e1e2d',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#1e1e2d',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  statTitle: {
    fontSize: '1.1rem',
    color: '#DDD',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 'bold'
  },
  actionButton: {
    marginLeft: '8px',
    backgroundColor: '#2a2a3c',
    color: '#FFF'
  },
  adminBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    color: '#f44336',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  editorBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    color: '#ffc107',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  userBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    color: '#2196f3',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  iconCircle: {
    borderRadius: '50%',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  }
};

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

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return styles.adminBadge;
      case 'editor':
        return styles.editorBadge;
      default:
        return styles.userBadge;
    }
  };

  return (
    <AdminLayout>
      <Box sx={styles.container}>
        {/* Header con título */}
        <Typography variant="h1" sx={styles.pageHeader}>
          Gestión de Usuarios
        </Typography>

        {/* Tarjetas de resumen */}
        <Box sx={styles.statsRow}>
          <Paper elevation={0} sx={styles.statCard}>
            <Box sx={styles.statHeader}>
              <Typography sx={styles.statTitle}>Administradores</Typography>
              <Box sx={{ ...styles.iconCircle, backgroundColor: 'rgba(244, 67, 54, 0.15)' }}>
                <SupervisorAccountIcon sx={{ color: '#f44336' }} />
              </Box>
            </Box>
            <Typography sx={{ ...styles.statValue, color: '#f44336' }}>
              {loading ? <CircularProgress size={20} color="error" /> : adminCount}
            </Typography>
          </Paper>
          
          <Paper elevation={0} sx={styles.statCard}>
            <Box sx={styles.statHeader}>
              <Typography sx={styles.statTitle}>Editores</Typography>
              <Box sx={{ ...styles.iconCircle, backgroundColor: 'rgba(255, 193, 7, 0.15)' }}>
                <EditRoleIcon sx={{ color: '#ffc107' }} />
              </Box>
            </Box>
            <Typography sx={{ ...styles.statValue, color: '#ffc107' }}>
              {loading ? <CircularProgress size={20} color="warning" /> : editorCount}
            </Typography>
          </Paper>
          
          <Paper elevation={0} sx={styles.statCard}>
            <Box sx={styles.statHeader}>
              <Typography sx={styles.statTitle}>Usuarios</Typography>
              <Box sx={{ ...styles.iconCircle, backgroundColor: 'rgba(33, 150, 243, 0.15)' }}>
                <PeopleIcon sx={{ color: '#2196f3' }} />
              </Box>
            </Box>
            <Typography sx={{ ...styles.statValue, color: '#2196f3' }}>
              {loading ? <CircularProgress size={20} color="primary" /> : userCount}
            </Typography>
          </Paper>
        </Box>

        {/* Sección de búsqueda y gestión de usuarios */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#1e1e2d',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.15)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.25)'
                }
              }
            }}
            sx={{ flex: { xs: '1', sm: '0 1 400px' } }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/users/create')}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#388E3C' },
              height: '56px', // Para igualar altura con el TextField
              whiteSpace: 'nowrap'
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Mensaje de error si existe */}
        {error && (
          <Paper 
            elevation={0}
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              backgroundColor: 'rgba(244, 67, 54, 0.15)',
              color: '#f44336',
              borderRadius: '8px',
              borderLeft: '4px solid #f44336'
            }}
          >
            <Typography>{error}</Typography>
          </Paper>
        )}

        {/* Tabla de usuarios */}
        <Paper elevation={0} sx={{ backgroundColor: '#1e1e2d', borderRadius: '8px', width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress color="primary" size={40} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Cargando usuarios...
              </Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No hay usuarios para mostrar
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2 }}>
                {searchTerm ? 'Prueba con otra búsqueda' : 'Puedes comenzar creando un nuevo usuario'}
              </Typography>
              {searchTerm ? (
                <Button 
                  color="primary"
                  onClick={() => setSearchTerm('')}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/users/create')}
                >
                  Nuevo Usuario
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer sx={{ width: '100%' }}>
                <Table sx={{ minWidth: '100%' }}>
                  <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#FFF', fontWeight: '500' }}>Usuario</TableCell>
                      <TableCell sx={{ color: '#FFF', fontWeight: '500' }}>Nombre</TableCell>
                      <TableCell sx={{ color: '#FFF', fontWeight: '500' }}>Email</TableCell>
                      <TableCell sx={{ color: '#FFF', fontWeight: '500' }}>Rol</TableCell>
                      <TableCell align="right" sx={{ color: '#FFF', fontWeight: '500' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell sx={{ color: '#FFF', fontWeight: 'medium' }}>{user.username}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {user.first_name ? `${user.first_name} ${user.last_name}` : '-'}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                        <TableCell>
                          <Box component="span" sx={getRoleBadgeStyle(user.role)}>
                            {getRoleLabel(user.role)}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar usuario">
                            <IconButton 
                              onClick={() => handleEdit(user.id)}
                              sx={{ color: '#ffc107' }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar usuario">
                            <IconButton 
                              onClick={() => handleDelete(user)}
                              sx={{ color: '#f44336' }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              sx={{ color: 'text.secondary' }}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    startIcon={<Box component="span" sx={{ fontSize: '1.2rem' }}>←</Box>}
                    sx={{
                      color: currentPage === 1 ? 'text.disabled' : '#FFF',
                      backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(0, 0, 0, 0.2)',
                      '&:hover': { backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(0, 0, 0, 0.3)' }
                    }}
                  >
                    Anterior
                  </Button>
                  
                  <Typography sx={{ color: 'text.secondary' }}>
                    Página {currentPage} de {totalPages}
                  </Typography>
                  
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    endIcon={<Box component="span" sx={{ fontSize: '1.2rem' }}>→</Box>}
                    sx={{
                      color: currentPage === totalPages ? 'text.disabled' : '#FFF',
                      backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(0, 0, 0, 0.2)',
                      '&:hover': { backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(0, 0, 0, 0.3)' }
                    }}
                  >
                    Siguiente
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Diálogo de confirmación para eliminar */}
      <UserDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        userName={userToDelete?.username || ''}
        isDeleting={deleting}
      />
    </AdminLayout>
  );
};

export default UsersPage;