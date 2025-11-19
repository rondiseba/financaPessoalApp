import React, { useState, MouseEvent } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  Assessment,
  AccountCircle,
  Logout,
  AccountBalanceWallet,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services';
import { useColorMode } from '../theme/ColorModeContext';
import { LayoutProps, MenuItem as MenuItemType } from '../types';

/**
 * Main application layout with sidebar navigation and top app bar
 * Responsive design with mobile drawer menu
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleColorMode } = useColorMode();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const user = authService.getUser();

  const menuItems: MenuItemType[] = [
    { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
    { text: 'Transações', icon: Receipt, path: '/transactions' },
    { text: 'Gastos Fixos', icon: AccountBalanceWallet, path: '/recurring' },
    { text: 'Relatórios', icon: Assessment, path: '/reports' }
  ];

  const handleNavigation = (path: string): void => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleUserMenuOpen = (event: MouseEvent<HTMLElement>): void => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = (): void => {
    setUserMenuAnchor(null);
  };

  const handleLogout = (): void => {
    authService.logout();
    handleUserMenuClose();
  };

  const SidebarContent: React.FC = () => (
    <Box sx={{ width: 240 }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" color="primary">
          Controle de Gastos
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <AccountBalanceWallet sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" component="div" color="primary">
              Controle de Gastos
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              Olá, {user?.name}
            </Typography>
            
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }}>
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu do usuário */}
      <Menu
        id="menu-appbar"
        anchorEl={userMenuAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
          <AccountCircle sx={{ mr: 1 }} />
          Perfil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Sair
        </MenuItem>
      </Menu>

      {/* Sidebar para desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <SidebarContent />
        </Drawer>
      )}

      {/* Sidebar para mobile */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          pt: { xs: 8, sm: 8 },
          pl: { md: 0 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
