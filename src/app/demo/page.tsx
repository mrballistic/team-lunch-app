"use client";

import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function DemoPage() {
  const theme = useTheme();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          680 Demo Team
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          This is a demo view for Team Lunch App. Explore features and UI here!
        </Typography>
      </Box>
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center', background: theme.palette.background.paper }}>
        <Typography variant="body1" gutterBottom>
          Demo features coming soon. You can view team, session, and voting flows here.
        </Typography>
      </Paper>
    </Container>
  );
}
