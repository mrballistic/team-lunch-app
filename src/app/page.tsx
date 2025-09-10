import { Container, Typography, Box, Paper } from '@mui/material';
import SupabaseAuth from '@/components/auth/SupabaseAuth';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6} sx={{ color: 'text.primary' }}>
        <Typography variant="h3" component="h1" gutterBottom color="text.primary">
          Team Lunch
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Suggest places, vote as a team, and pick the best lunch spot together.
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, width: '100%', maxWidth: 520, bgcolor: 'background.paper', color: 'text.primary' }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            Sign in to your team
          </Typography>
          <SupabaseAuth />
        </Paper>
      </Box>
    </Container>
  );
}
