"use client";
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SupabaseAuth from '@/components/auth/SupabaseAuth';

export default function AuthPage() {
  const theme = useTheme();
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🔐 Sign In
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This is a placeholder sign-in page. Integrate Supabase or your auth provider here.
        </Typography>
      </Box>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', background: theme.palette.background.paper }}>
        <Button variant="contained" disabled sx={{ mb: 2 }}>
          Sign in with Supabase (Coming Soon)
        </Button>
      </Paper>
      <SupabaseAuth />
    </Container>
  );
}
