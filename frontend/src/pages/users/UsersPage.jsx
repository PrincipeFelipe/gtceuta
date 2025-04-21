// src/pages/users/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: theme.palette.divider,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/');
        setUsers(response.data);
      } catch (err) {
        setError('Error al cargar los usuarios. Por favor, inténtalo de nuevo.');
        console.error('Error al cargar los usuarios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await api.delete(`/users/${id}/`);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        alert('Error al eliminar el usuario');
        console.error('Error al eliminar el usuario:', err);
      }
    }
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'editor':
        return 'warning';
      default:
        return 'primary';
    }
  };

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

  return (
    <AdminLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Usuarios
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/users/create"
          disableElevation
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Usuario</StyledTableCell>
                  <StyledTableCell>Nombre</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Rol</StyledTableCell>
                  <StyledTableCell align="right">Acciones</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <StyledTableRow key={user.id}>
                    <StyledTableCell>{user.id}</StyledTableCell>
                    <StyledTableCell>{user.username}</StyledTableCell>
                    <StyledTableCell>
                      {user.first_name ? `${user.first_name} ${user.last_name}` : '-'}
                    </StyledTableCell>
                    <StyledTableCell>{user.email}</StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        label={getRoleLabel(user.role)} 
                        color={getRoleChipColor(user.role)} 
                        size="small" 
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <IconButton 
                        size="small"
                        color="primary" 
                        aria-label="editar" 
                        onClick={() => handleEdit(user.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error" 
                        aria-label="eliminar" 
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </AdminLayout>
  );
};

export default UsersPage;