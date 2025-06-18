import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, Divider, List, IconButton, Avatar } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Folder, Settings, Logout } from '@mui/icons-material';
import SidebarItem from './SidebarItem';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { currentUser, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Press Kit Builder
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <SidebarItem to="/" icon={<Dashboard />} label="Dashboard" />
        <SidebarItem to="/press-kits" icon={<Folder />} label="Press Kits" />
        <SidebarItem to="/settings" icon={<Settings />} label="Settings" />
      </List>
      <Divider />
      <Box sx={{ p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
        <SidebarItem 
          to="#" 
          icon={<Logout />} 
          label="Logout" 
          onClick={() => logout()}
        />
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Digital Press Kit Builder
          </Typography>
          <IconButton color="inherit">
            <Avatar>{currentUser?.name?.charAt(0) || 'U'}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}