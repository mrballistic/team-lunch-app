import { Container, Typography, Box, Paper, Button } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          Team Lunch App
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Help teams vote on where to go to lunch
        </Typography>
      </Box>
  <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Team Lunch!
        </Typography>
        <Typography color="text.secondary" mb={3}>
          We&apos;re building the ultimate team lunch decision tool. 
          Suggest restaurants, vote, and let the app handle the rest!
        </Typography>
        <Box display="flex" gap={2} justifyContent="center">
          <Link href="/demo" legacyBehavior>
            <a>
              <Button variant="contained">View Demo Team</Button>
            </a>
          </Link>
          <Link href="/auth" legacyBehavior>
            <a>
              <Button variant="outlined">Sign In</Button>
            </a>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
