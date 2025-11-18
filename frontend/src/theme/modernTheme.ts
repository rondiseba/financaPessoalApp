import { createTheme, Theme } from '@mui/material/styles';

/**
 * Modern theme with gradients and glassmorphism effects
 * Designed for light mode with premium visual appeal
 */
const modernTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',      // Vibrant indigo
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#EC4899',      // Modern pink
      light: '#F472B6',
      dark: '#DB2777',
    },
    success: {
      main: '#10B981',      // Mint green
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',      // Soft red
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#F8FAFC',    // Ultra light gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.02)',
    '0px 4px 8px rgba(0, 0, 0, 0.04)',
    '0px 8px 16px rgba(0, 0, 0, 0.06)',
    '0px 12px 24px rgba(0, 0, 0, 0.08)',
    '0px 16px 32px rgba(0, 0, 0, 0.10)',
    '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
    '0px 2px 4px rgba(0, 0, 0, 0.02)',
    '0px 4px 8px rgba(0, 0, 0, 0.04)',
    '0px 8px 16px rgba(0, 0, 0, 0.06)',
    '0px 12px 24px rgba(0, 0, 0, 0.08)',
    '0px 16px 32px rgba(0, 0, 0, 0.10)',
    '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
    '0px 20px 40px rgba(0, 0, 0, 0.12)',
    '0px 24px 48px rgba(0, 0, 0, 0.14)',
    '0px 28px 56px rgba(0, 0, 0, 0.16)',
    '0px 32px 64px rgba(0, 0, 0, 0.18)',
    '0px 36px 72px rgba(0, 0, 0, 0.20)',
    '0px 40px 80px rgba(0, 0, 0, 0.22)',
    '0px 44px 88px rgba(0, 0, 0, 0.24)',
    '0px 48px 96px rgba(0, 0, 0, 0.26)',
    '0px 52px 104px rgba(0, 0, 0, 0.28)',
    '0px 56px 112px rgba(0, 0, 0, 0.30)',
  ],
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#6366F1',
            },
          },
        },
      },
    },
  },
});

export default modernTheme;
