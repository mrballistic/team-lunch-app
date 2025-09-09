'use client';

import * as React from 'react';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Always call useMediaQuery, but disable SSR for media query detection
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });

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
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
