// src/pages/Dashboard.jsx
import React from 'react';
import { Typography, Paper, Box, Grid } from '@mui/material';
import AdminLayout from '../layouts/AdminLayout';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 140,
  borderRadius: theme.shape.borderRadius,
  transition: '0.3s',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transform: 'translateY(-5px)'
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const DashboardItem = ({ title, count, icon }) => {
  return (
    <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
      <StyledPaper>
        <IconWrapper>
          {icon}
          <Typography variant="h6" component="h2" sx={{ ml: 1, color: 'text.primary' }}>
            {title}
          </Typography>
        </IconWrapper>
        <Typography variant="h4" component="p" color="primary" fontWeight="bold">
          {count}
        </Typography>
      </StyledPaper>
    </Grid>
  );
};

const Dashboard = () => {
  // Estos datos deberían venir de una API
  const stats = {
    users: 15,
    posts: 24,
    sponsors: 8
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          Bienvenido al panel de administración de GT Ceuta. Aquí podrás gestionar los usuarios, posts del blog y patrocinadores.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <DashboardItem 
          title="Usuarios" 
          count={stats.users} 
          icon={<PeopleIcon fontSize="large" color="primary" />} 
        />
        <DashboardItem 
          title="Posts" 
          count={stats.posts} 
          icon={<ArticleIcon fontSize="large" color="primary" />} 
        />
        <DashboardItem 
          title="Patrocinadores" 
          count={stats.sponsors} 
          icon={<BusinessIcon fontSize="large" color="primary" />} 
        />
      </Grid>
      
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Información del Torneo
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="body1" paragraph sx={{ color: 'text.primary' }}>
            El I GT de Ceuta se celebrará en el Centro Cultural 'La Estación de Ferrocarril', 
            un espacio emblemático totalmente renovado que combina la historia de la ciudad 
            con modernas instalaciones.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Fechas del evento: 28-29 de junio de 2025
          </Typography>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default Dashboard;