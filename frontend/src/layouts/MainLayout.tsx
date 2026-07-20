import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, CssBaseline, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import vivoLogo from '../assets/vivo-logo.svg';

const drawerWidth = 240;

import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Line Management', icon: <SettingsIcon />, path: '/lines' },
  { text: 'Barcode History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Defect Search', icon: <SearchIcon />, path: '/search' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Analytics', icon: <TimelineIcon />, path: '/analytics' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#eef1f8' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1d4ed8',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', width: drawerWidth - 24 }}>
            <img src={vivoLogo} alt="vivo" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            AOI Quality Intelligence Portal
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid rgba(0,0,0,0.08)' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItem 
                  button 
                  key={item.text} 
                  onClick={() => navigate(item.path)}
                  sx={{
                    mb: 1,
                    mx: 1,
                    borderRadius: 2,
                    backgroundColor: isSelected ? 'rgba(29, 78, 216, 0.08)' : 'transparent',
                    color: isSelected ? '#1d4ed8' : '#475569',
                    '&:hover': {
                      backgroundColor: 'rgba(29, 78, 216, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? '#1d4ed8' : '#64748b' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
