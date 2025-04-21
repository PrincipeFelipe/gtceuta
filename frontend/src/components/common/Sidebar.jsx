// src/components/common/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import ImageIcon from '@mui/icons-material/Image';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import { styled } from '@mui/material/styles';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: '4px 0',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '20',
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '30',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: '40px',
  color: theme.palette.text.secondary,
}));

const Sidebar = () => {
  const { logoutUser } = useAuth();

  return (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            GT CEUTA
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ p: 2 }}>
        <ListItem disablePadding>
          <StyledListItemButton component={RouterLink} to="/dashboard">
            <StyledListItemIcon>
              <DashboardIcon />
            </StyledListItemIcon>
            <ListItemText primary="Dashboard" />
          </StyledListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <StyledListItemButton component={RouterLink} to="/users">
            <StyledListItemIcon>
              <PeopleIcon />
            </StyledListItemIcon>
            <ListItemText primary="Usuarios" />
          </StyledListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <StyledListItemButton component={RouterLink} to="/posts">
            <StyledListItemIcon>
              <ArticleIcon />
            </StyledListItemIcon>
            <ListItemText primary="Blog" />
          </StyledListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <StyledListItemButton component={RouterLink} to="/sponsors">
            <StyledListItemIcon>
              <BusinessIcon />
            </StyledListItemIcon>
            <ListItemText primary="Patrocinadores" />
          </StyledListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <StyledListItemButton component={RouterLink} to="/images">
            <StyledListItemIcon>
              <ImageIcon />
            </StyledListItemIcon>
            <ListItemText primary="Imágenes" />
          </StyledListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List sx={{ p: 2 }}>
        <ListItem disablePadding>
          <StyledListItemButton onClick={logoutUser}>
            <StyledListItemIcon>
              <LogoutIcon />
            </StyledListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </StyledListItemButton>
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;