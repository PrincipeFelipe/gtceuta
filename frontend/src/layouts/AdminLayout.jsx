// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, Typography, IconButton, AppBar, Drawer, Avatar, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 'bold' }}>
            Panel de Administración - GT Ceuta
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </Typography>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                width: 36,
                height: 36,
              }}
            >
              {getInitials(user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username)}
            </Avatar>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
        >
          <Sidebar />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;