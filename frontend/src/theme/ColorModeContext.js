import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ColorModeContext = createContext();

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within ColorModeProvider');
  }
  return context;
};

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: {
                  main: '#6366F1',
                  light: '#818CF8',
                  dark: '#4F46E5',
                  contrastText: '#fff',
                },
                secondary: {
                  main: '#EC4899',
                  light: '#F472B6',
                  dark: '#DB2777',
                },
                success: {
                  main: '#10B981',
                  light: '#34D399',
                  dark: '#059669',
                },
                error: {
                  main: '#EF4444',
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
                  default: '#F8FAFC',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#1E293B',
                  secondary: '#64748B',
                  disabled: '#94A3B8',
                },
                divider: '#E2E8F0',
              }
            : {
                primary: {
                  main: '#818CF8',
                  light: '#A5B4FC',
                  dark: '#6366F1',
                  contrastText: '#fff',
                },
                secondary: {
                  main: '#F472B6',
                  light: '#F9A8D4',
                  dark: '#EC4899',
                },
                success: {
                  main: '#34D399',
                  light: '#6EE7B7',
                  dark: '#10B981',
                },
                error: {
                  main: '#F87171',
                  light: '#FCA5A5',
                  dark: '#EF4444',
                },
                warning: {
                  main: '#FBBF24',
                  light: '#FCD34D',
                  dark: '#F59E0B',
                },
                info: {
                  main: '#60A5FA',
                  light: '#93C5FD',
                  dark: '#3B82F6',
                },
                background: {
                  default: '#0F172A',
                  paper: '#1E293B',
                },
                text: {
                  primary: '#F1F5F9',
                  secondary: '#94A3B8',
                  disabled: '#64748B',
                },
                divider: '#334155',
              }),
        },
        shadows: [
          'none',
          '0px 2px 4px rgba(0, 0, 0, 0.1)',
          '0px 4px 8px rgba(0, 0, 0, 0.15)',
          '0px 8px 16px rgba(0, 0, 0, 0.2)',
          '0px 12px 24px rgba(0, 0, 0, 0.25)',
          '0px 16px 32px rgba(0, 0, 0, 0.3)',
          '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          '8px 8px 16px #0a0f1e, -8px -8px 16px #142038',
          '0px 2px 4px rgba(0, 0, 0, 0.1)',
          '0px 4px 8px rgba(0, 0, 0, 0.15)',
          '0px 8px 16px rgba(0, 0, 0, 0.2)',
          '0px 12px 24px rgba(0, 0, 0, 0.25)',
          '0px 16px 32px rgba(0, 0, 0, 0.3)',
          '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          '8px 8px 16px #0a0f1e, -8px -8px 16px #142038',
          '0px 2px 4px rgba(0, 0, 0, 0.1)',
          '0px 4px 8px rgba(0, 0, 0, 0.15)',
          '0px 8px 16px rgba(0, 0, 0, 0.2)',
          '0px 12px 24px rgba(0, 0, 0, 0.25)',
          '0px 16px 32px rgba(0, 0, 0, 0.3)',
          '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          '8px 8px 16px #0a0f1e, -8px -8px 16px #142038',
          '0px 2px 4px rgba(0, 0, 0, 0.1)',
          '0px 4px 8px rgba(0, 0, 0, 0.15)',
          '0px 8px 16px rgba(0, 0, 0, 0.2)',
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
                  boxShadow: mode === 'light' 
                    ? '0 4px 12px rgba(0,0,0,0.15)'
                    : '0 4px 12px rgba(0,0,0,0.5)',
                },
              },
              contained: {
                background: mode === 'light'
                  ? 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
                  : 'linear-gradient(135deg, #818CF8 0%, #F472B6 100%)',
                '&:hover': {
                  background: mode === 'light'
                    ? 'linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)'
                    : 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                boxShadow: mode === 'light'
                  ? '0 4px 20px rgba(0,0,0,0.08)'
                  : '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'light'
                    ? '0 8px 30px rgba(0,0,0,0.12)'
                    : '0 8px 30px rgba(0,0,0,0.5)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === 'light'
                  ? '0 2px 12px rgba(0,0,0,0.06)'
                  : '0 2px 12px rgba(0,0,0,0.3)',
              },
              elevation1: {
                boxShadow: mode === 'light'
                  ? '0 2px 12px rgba(0,0,0,0.06)'
                  : '0 2px 12px rgba(0,0,0,0.3)',
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
                    borderColor: mode === 'light' ? '#6366F1' : '#818CF8',
                  },
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
