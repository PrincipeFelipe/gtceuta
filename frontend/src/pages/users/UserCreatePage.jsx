// src/pages/users/UserCreatePage.jsx
import React, { useState } from 'react';
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
  FormHelperText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .required('El nombre de usuario es obligatorio'),
  email: yup
    .string()
    .email('Introduce un email válido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es obligatoria'),
  first_name: yup
    .string(),
  last_name: yup
    .string(),
  role: yup
    .string()
    .required('El rol es obligatorio')
});

const UserCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'user'
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        await api.post('/users/register/', values);
        navigate('/users');
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            (err.response?.data?.username && `Username: ${err.response.data.username[0]}`) || 
                            (err.response?.data?.email && `Email: ${err.response.data.email[0]}`) || 
                            'Ha ocurrido un error al crear el usuario';
        setError(errorMessage);
        console.error('Error al crear el usuario:', err);
      } finally {
        setLoading(false);
      }
    }
  });

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
          Crear Usuario
        </Typography>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
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
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disableElevation
            >
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </AdminLayout>
  );
};

export default UserCreatePage;