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
  Stack,
  FormHelperText,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../hooks/useAuth';

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

const passwordValidationSchema = yup.object({
  new_password: yup
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password'), null], 'Las contraseñas deben coincidir')
});

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}/`);
        setUser(response.data);
        setError(null);
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
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      setError(null);
      try {
        // Asegurar que el rol se envía en el formato correcto
        const dataToSend = {
          ...values,
          profile: {
            role: values.role
          }
        };
        await api.put(`/users/${id}/`, dataToSend);
        navigate('/users');
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            (err.response?.data?.username && `Username: ${err.response.data.username[0]}`) || 
                            (err.response?.data?.email && `Email: ${err.response.data.email[0]}`) || 
                            'Ha ocurrido un error al actualizar el usuario';
        setError(errorMessage);
        console.error('Error al actualizar el usuario:', err);
      } finally {
        setSaving(false);
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      new_password: '',
      confirm_password: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(false);
      try {
        await api.post(`/users/${id}/change-password/`, { 
          password: values.new_password 
        });
        setPasswordSuccess(true);
        passwordFormik.resetForm();
      } catch (err) {
        setPasswordError('Error al cambiar la contraseña');
        console.error('Error al cambiar la contraseña:', err);
      } finally {
        setPasswordLoading(false);
      }
    }
  });

  // Actualiza los valores iniciales cuando se carga el usuario
  useEffect(() => {
    if (user) {
      formik.setValues({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'user',
      });
    }
  }, [user]);

  // Verifica si el usuario actual está editando su propio perfil
  const isSelfEdit = currentUser && currentUser.id === parseInt(id);

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
          color="inherit"
        >
          Volver a usuarios
        </Button>
        <Typography variant="h4" component="h1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Editar Usuario
        </Typography>
        {user && (
          <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
            {user.username} {isSelfEdit && <span style={{ color: '#ef4444' }}>(Tu cuenta)</span>}
          </Typography>
        )}
      </Box>

      <Paper sx={{ p: 3, backgroundColor: 'background.paper', mb: 4 }}>
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
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
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
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
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
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
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
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl 
                fullWidth
                error={formik.touched.role && Boolean(formik.errors.role)}
                disabled={isSelfEdit} // No permitir cambiar el propio rol
              >
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  label="Rol"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="user">Usuario</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <FormHelperText>{formik.errors.role}</FormHelperText>
                )}
                {isSelfEdit && (
                  <FormHelperText>No puedes cambiar tu propio rol</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/users')}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disableElevation
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 'bold' }}>
          Cambiar contraseña
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {passwordError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {passwordError}
          </Alert>
        )}

        {passwordSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            La contraseña ha sido cambiada con éxito.
          </Alert>
        )}

        <Box component="form" onSubmit={passwordFormik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="new_password"
                name="new_password"
                label="Nueva contraseña"
                type="password"
                value={passwordFormik.values.new_password}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.new_password && Boolean(passwordFormik.errors.new_password)}
                helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="confirm_password"
                name="confirm_password"
                label="Confirmar contraseña"
                type="password"
                value={passwordFormik.values.confirm_password}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.confirm_password && Boolean(passwordFormik.errors.confirm_password)}
                helperText={passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={passwordLoading}
              startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : null}
              disableElevation
            >
              {passwordLoading ? 'Cambiando...' : 'Cambiar contraseña'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </AdminLayout>
  );
};

export default UserEditPage;