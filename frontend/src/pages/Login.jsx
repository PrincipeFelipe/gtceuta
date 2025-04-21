// src/pages/Login.jsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  Divider, 
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: '12px 0',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const validationSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es obligatorio'),
  password: yup
    .string()
    .required('La contraseña es obligatoria'),
});

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await login(values);
        const userData = await getCurrentUser();
        
        // Verificar si el usuario es administrador
        if (userData.role !== 'admin') {
          setError('No tienes permisos para acceder al panel de administración');
          setLoading(false);
          return;
        }
        
        loginUser(userData);
        navigate('/dashboard');
      } catch (err) {
        setError(err.detail || 'Error en la autenticación. Comprueba tus credenciales.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
            GT CEUTA
          </Typography>
          <Typography variant="h6" color="textPrimary" sx={{ mb: 3 }}>
            Iniciar sesión
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              variant="outlined"
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              variant="outlined"
            />
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              disableElevation
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
            </StyledButton>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} GT Ceuta. Todos los derechos reservados.
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Login;