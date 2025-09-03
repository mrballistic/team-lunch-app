import { Container, Typography, Box, Paper, Button } from '@mui/material';

export default function AuthPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🔐 Sign In
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This is a placeholder sign-in page. Integrate Supabase or your auth provider here.
        </Typography>
      </Box>
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Button variant="contained" disabled>
          Sign in with Supabase (Coming Soon)
        </Button>
      </Paper>
    </Container>
  );
}
