// src/pages/users/UserEditPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const validationSchema = yup.object({
  username: yup
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .required('El nombre de usuario es obligatorio'),
  email: yup
    .string()
    .email('Introduce un email válido')
    .required('El email es obligatorio'),
  first_name: yup
    .string(),
  last_name: yup
    .string(),
  role: yup
    .string()
    .required('El rol es obligatorio')
});

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}/`);
        setUser(response.data);
      } catch (err) {
        setError('Error al cargar los datos del usuario');
        console.error('Error al cargar los datos del usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      role: user?.role || 'user',
      // No incluimos password para evitar sobrescribirla inadvertidamente
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      setError(null);
      try {
        await api.put(`/users/${id}/`, values);
        navigate('/users');
      } catch (err) {
        setError(err.response?.data?.detail || 'Ha ocurrido un error al actualizar el usuario');
        console.error('Error al actualizar el usuario:', err);
      } finally {
        setSaving(false);
      }
    }
  });

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mb: 2 }}
        >
          Volver a usuarios
        </Button>
        <Typography variant="h4" component="h1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Editar Usuario
        </Typography>
      </Box>

      <StyledPaper>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Nombre de usuario"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="Nombre"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Apellidos"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  label="Rol"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="user">Usuario</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Deja en blanco el campo de contraseña si no deseas modificarla.
              </Typography>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Nueva Contraseña (opcional)"
                type="password"
                value={formik.values.password || ''}
                onChange={formik.handleChange}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/users')}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                  disableElevation
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </AdminLayout>
  );
};

export default UserEditPage;