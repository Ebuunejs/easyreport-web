import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Chip,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  BeachAccess as BeachAccessIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  ExitToApp as LogoutIcon,
  Shield as ShieldIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

// Funktion zur Übersetzung der Rolle in lesbare deutsche Bezeichnungen
const translateRole = (role) => {
  const roleTranslations = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Mitarbeiter',
    chief: 'Teamleiter',
    user: 'Benutzer'
  };
  
  return roleTranslations[role] || role;
};

// Funktion zur Bestimmung der Farbe für die Rollen-Chips
const getRoleColor = (role) => {
  const roleColors = {
    admin: '#0584C7',
    manager: '#0584C7',
    employee: '#0584C7',
    chief: '#0584C7',
    user: '#0584C7'
  };
  
  return roleColors[role] || 'default';
};

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, roles:['admin', 'manager', 'chief', 'subcontractor'], path: '/' },
  { text: 'Firmen', icon: <BusinessIcon />,  roles:['admin', 'manager'], path: '/companies' },
  { text: 'Organisationen', icon: <BusinessIcon />, roles:['admin', 'manager'], path: '/organization' },
  { text: 'Projekte', icon: <BusinessIcon />, roles:['subcontractor'], path: '/subcontractor-projects' },
  { text: 'Mitarbeiter', icon: <PeopleIcon />, roles:['admin', 'manager'], path: '/employees' },
  { text: 'Zeiterfassung', icon: <AccessTimeIcon />, roles:['admin', 'subcontractor', 'manager'], path: '/time-tracking' },
  {
    text: 'Kosten',
    icon: <MoneyIcon />,
    roles: ['admin', 'manager'],
    children: [
      { text: 'Betriebskosten', path: '/operating-costs' },
      { text: 'Projektkosten', path: '/project-costs' }
    ]
  },
  { text: 'Verträge', icon: <DescriptionIcon />, roles:['admin', 'manager'], path: '/contracts' },
  { text: 'Berichte', icon: <AssessmentIcon />, roles:['admin', 'manager'], path: '/reports' },
  { text: 'Gewinn', icon: <TrendingUpIcon />, roles:['admin', 'manager'], path: '/profit' },
  { text: 'Ferienplanung', icon: <BeachAccessIcon />, roles:['admin', 'manager'], path: '/vacation' },
  { text: 'Einstellungen', icon: <SettingsIcon />, roles:['admin', 'manager'], path: '/settings' },
  { text: 'Employee Dashboard', icon: <AccountCircleIcon />, roles:['employee'], path: '/employee/dashboard' },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, role, hasRole, hasProfitModule, hasEmployeeModule, hasContractModule, hasReportModule, hasVacationModule } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    navigate('/login');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    } finally {
    handleProfileMenuClose();
    }
  };

  // Öffne automatisch das Kosten-Untermenü, wenn ein Kindpfad aktiv ist
  useEffect(() => {
    const isCostsChild = ['/operating-costs', '/project-costs'].includes(location.pathname);
    if (isCostsChild) {
      setOpenMenus((prev) => ({ ...prev, Kosten: true }));
    }
  }, [location.pathname]);

  const isChildPathActive = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname === child.path);
  };

  const findMenuTitleByPath = (path) => {
    for (const item of getFilteredMenuItems()) {
      if (item.path && item.path === path) return item.text;
      if (item.children) {
        const found = item.children.find((child) => child.path === path);
        if (found) return found.text;
      }
    }
    return null;
  };

  // Funktion zur Filterung der MenuItems basierend auf Rollen und Moduleinstellungen
  const getFilteredMenuItems = () => {
    return menuItems.filter(item => {
      // Prüfe zuerst die Rollenberechtigung
      const hasRoleAccess = !item.roles || (item.roles && role && item.roles.includes(role));
      
      if (!hasRoleAccess) {
        return false;
      }

      // Prüfe Moduleinstellungen für spezifische Menüpunkte
      switch (item.text) {
        case 'Gewinn':
          return hasProfitModule();
        case 'Mitarbeiter':
          return hasEmployeeModule();
        case 'Verträge':
          return hasContractModule();
        case 'Berichte':
          return hasReportModule();
        case 'Ferienplanung':
          return hasVacationModule();
        default:
          return true; // Alle anderen Menüpunkte werden angezeigt
      }
    });
  };

  // Icon für die Rolle
  const getRoleIcon = () => {
    if (hasRole('admin')) return <ShieldIcon fontSize="small" />;
    if (hasRole('manager')) return <BusinessIcon fontSize="small" />;
    if (hasRole('chief')) return <PersonIcon fontSize="small" />;
    return null;
  };

  const drawer = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
        <img 
          src={require('../../assets/logo-ende.png')} 
          alt="Logo" 
          style={{ 
            height: '90px', 
            width: 'auto',
            marginTop: '20px',
          
            objectFit: 'contain'
          }} 
        />
      </Box>
      <Divider sx={{ height: '1px', backgroundColor: '#e0e0e0', marginTop: '20px' }} />
      
      {/* Benutzerinformation mit Rolle */}
      {user && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              margin: '0 auto', 
              bgcolor: getRoleColor(role) + '.main'
            }}
          >
            {user.name?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
            {user.name + ' ' + user.surname || 'Benutzer'}
          </Typography>
          
          {role && (
            <Chip
              icon={getRoleIcon()}
              label={translateRole(role)}
              size="small"
              color={getRoleColor(role)}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      )}
      
      <Divider sx={{ height: '1px', backgroundColor: '#e0e0e0', mb: 1 }} />
      
      <List sx={{ flexGrow: 1 }}>
        {getFilteredMenuItems().map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                selected={item.children ? isChildPathActive(item) : location.pathname === item.path}
                onClick={() => {
                  if (item.children) {
                    setOpenMenus((prev) => ({ ...prev, [item.text]: !prev[item.text] }));
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
             >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.children ? (
                  (openMenus[item.text] || isChildPathActive(item)) ? <ExpandLessIcon /> : <ExpandMoreIcon />
                ) : null}
              </ListItemButton>
            </ListItem>

            {item.children && (
              <Collapse in={openMenus[item.text] || isChildPathActive(item)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                        onClick={() => navigate(child.path)}
                      >
                        <ListItemIcon>
                          <MoneyIcon />
                        </ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Abmelden" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          height: { xs: isMobile ? '110px' : '68px' }, // Höhe um 20px erhöht
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#10A8C0'
        }}
      >
        <Toolbar
          sx={{
            flexDirection: { xs: 'row', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            px: { xs: 1, sm: 2 },
            minHeight: { xs: '91px !important', sm: '68px !important' } // Angepasste Mindesthöhe
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: { xs: 1, sm: 2 }, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {findMenuTitleByPath(location.pathname) || 'Dashboard'}
            </Typography>
          </Box>
          
          {/* Admin-Icon in der Mitte entfernt */}
          
          <IconButton
            size="small"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ p: { xs: 0.25, sm: 0.5 } }}
          >
            <Avatar sx={{ 
              bgcolor: role ? getRoleColor(role) + '.main' : 'inherit',
              width: { xs: 24, sm: 28 },
              height: { xs: 24, sm: 28 }
            }}>
              
              {user?.name?.charAt(0) || 'A'}
              
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {role && (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Rolle: {translateRole(role)}
                  </Typography>
                </Box>
              </MenuItem>
            )}
            <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
              Profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Abmelden
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mail-box"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Bessere Performance beim Öffnen auf Mobilgeräten
          }}
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
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1.5, sm: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: { xs: '91px', sm: '68px' }, // Angepasster Abstand für die neue Höhe
          overflowX: 'hidden'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 