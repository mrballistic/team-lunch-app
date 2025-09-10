"use client";

import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import SupabaseAuth from '@/components/auth/SupabaseAuth';

export default function AuthPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🔐 Sign In
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Sign in or create an account to join your team.
        </Typography>
      </Box>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 } }}>
        <SupabaseAuth />
      </Paper>
    </Container>
  );
}
