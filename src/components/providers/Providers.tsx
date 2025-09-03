'use client';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';

export default function Providers({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = useMemo(
    () => createTheme({ 
      palette: { 
        mode: prefersDark ? 'dark' : 'light' 
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
    }),
    [prefersDark]
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
