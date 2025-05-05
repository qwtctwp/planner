import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SideBarProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  width?: number;
}

const SideBar: React.FC<SideBarProps> = ({ open, onClose, children, width = 250 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const menuItems = [
    { 
      text: 'Главная', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      active: pathname === '/dashboard' && (!searchParams || !searchParams.get('view'))
    },
    { 
      text: 'Календарь', 
      icon: <CalendarIcon />, 
      path: '/calendar',
      active: pathname === '/calendar'
    },
    { 
      text: 'Задания', 
      icon: <AssignmentIcon />, 
      path: '/assignments',
      active: pathname === '/assignments'
    },
    { 
      text: 'Карточки', 
      icon: <SchoolIcon />, 
      path: '/subjects',
      active: pathname === '/subjects'
    },
    { 
      text: 'Категории', 
      icon: <CategoryIcon />, 
      path: '/categories',
      active: pathname === '/categories'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    
    // Update URL and document title for better user experience
    if (path.includes('?view=')) {
      const viewType = path.split('?view=')[1];
      document.title = viewType === 'week' ? 'Расписание на неделю' : 
                       viewType === 'day' ? 'Расписание на день' : 
                       viewType === 'month' ? 'Расписание на месяц' : 'Главная';
    }
    
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          position: 'relative',
          whiteSpace: 'nowrap',
          width: width,
          boxSizing: 'border-box',
          backgroundColor: '#f8fbff',
          borderRight: '1px solid rgba(165, 199, 228, 0.15)',
          backgroundImage: 'none',
          ...(!open && {
            overflowX: 'hidden',
            width: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid rgba(165, 199, 228, 0.15)',
        background: 'linear-gradient(to right, #f2f7fb, #eaf2f8)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#A5C7E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              mr: 1.5
            }}
          >
            S
          </Box>
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontWeight: 600,
              color: '#2A5A84'
            }}
          >
            StudyPlanner
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#8CA2B4' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      {children ? children : (
        <>
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: '0 20px 20px 0',
                      mx: 1,
                      py: 1.2,
                      backgroundColor: item.active ? alpha('#A5C7E4', 0.12) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha('#A5C7E4', 0.08),
                      },
                      position: 'relative',
                      '&::before': item.active ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '60%',
                        backgroundColor: '#A5C7E4',
                        borderRadius: '0 4px 4px 0',
                      } : {}
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: item.active ? '#84A7C4' : '#8CA2B4'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        '& .MuiTypography-root': {
                          fontWeight: item.active ? 600 : 500,
                          fontSize: '0.95rem',
                          color: item.active ? '#2A5A84' : '#5E7E99'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Box sx={{ 
            mt: 'auto', 
            p: 2, 
            borderTop: '1px solid rgba(165, 199, 228, 0.15)',
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#8CA2B4',
                textAlign: 'center'
              }}
            >
              © {new Date().getFullYear()} йоу
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default SideBar; 