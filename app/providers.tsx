'use client';

import React, { ReactNode, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ruRU } from '@mui/material/locale';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';

// Pastel blue color palette
const PASTEL_BLUE = {
  main: '#A5C7E4',   // Main pastel blue
  light: '#C9DDF0',  // Lighter pastel blue
  dark: '#84A7C4',   // Darker pastel blue
  lighter: '#EAF2F8', // Very light blue for backgrounds
  darker: '#5A8CB3', // Deeper blue for text
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PASTEL_BLUE.main,
      light: PASTEL_BLUE.light,
      dark: PASTEL_BLUE.dark,
    },
    secondary: {
      main: '#9DB2C9', // Muted blue-gray
      light: '#C6D4E2',
      dark: '#7A8FA6',
    },
    background: {
      default: PASTEL_BLUE.lighter, // Light blue background
      paper: '#FFFFFF',
    },
    info: {
      main: '#95B7CE', // Slightly deeper blue
    },
    success: {
      main: '#9ED0A3', // Soft green
    },
    warning: {
      main: '#E9D296', // Soft yellow
    },
    error: {
      main: '#E89BA2', // Soft red
    },
    text: {
      primary: '#2A5A84', // Dark blue
      secondary: '#5E7E99', // Medium blue-gray
    },
  },
  typography: {
    fontFamily: "'Quicksand', 'Inter', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: `0 4px 20px 0 rgba(165, 199, 228, 0.12)`,
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: `0 4px 14px 0 rgba(165, 199, 228, 0.3)`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: '#FFFFFF',
          boxShadow: `0 4px 20px 0 rgba(165, 199, 228, 0.12)`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2A5A84',
          boxShadow: `0 2px 12px 0 rgba(165, 199, 228, 0.15)`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover': {
            backgroundColor: `rgba(165, 199, 228, 0.08)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#D1D5DB',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 4px 20px 0 rgba(165, 199, 228, 0.12)`,
          overflow: 'hidden',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: `0 6px 16px rgba(165, 199, 228, 0.35)`,
        },
        primary: {
          '&:hover': {
            backgroundColor: PASTEL_BLUE.dark,
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          '&.Mui-selected': {
            backgroundColor: PASTEL_BLUE.main,
            color: '#FFFFFF',
          }
        }
      }
    }
  },
}, ruRU);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocaleProvider>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
} 