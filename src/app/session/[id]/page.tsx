'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import SessionConfigModal from '@/components/sessions/SessionConfigModal';

interface Session {
  id: string;
  status: 'draft' | 'open' | 'closed';
  max_walk_minutes: number | null;
  price_min: number | null;
  price_max: number | null;
  cooldown_days: number | null;
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
}

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual auth token
      const response = await fetch(`/api/sessions/${params.id}`, {
        headers: {
          'Authorization': 'Bearer temp-token'
        }
      });
      if (!response.ok) throw new Error('Failed to load session');
      setSession(await response.json());
    } catch (err) {
      setError('Failed to load session.');
    } finally {
      setLoading(false);
    }
  };

  // Load session on mount
  useState(() => { loadSession(); });

  const handleOpenConfig = () => setConfigOpen(true);
  const handleCloseConfig = () => setConfigOpen(false);
  const handleCreateSession = async (config: {
    maxWalkMinutes: number;
    priceMin: number;
    priceMax: number;
    cooldownDays: number;
  }) => {
    // TODO: Call API to create session
    setConfigOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading session...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadSession} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Session not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Lunch Session
        </Typography>
        <Button variant="contained" onClick={handleOpenConfig}>
          Configure Session
        </Button>
      </Box>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Status: <Chip label={session.status} color={session.status === 'open' ? 'success' : session.status === 'closed' ? 'default' : 'warning'} />
        </Typography>
        <Typography>
          Max Walk Minutes: {session.max_walk_minutes ?? 'N/A'}
        </Typography>
        <Typography>
          Price Range: {session.price_min ?? 'N/A'} - {session.price_max ?? 'N/A'}
        </Typography>
        <Typography>
          Cooldown Days: {session.cooldown_days ?? 'N/A'}
        </Typography>
        <Typography>
          Created At: {new Date(session.created_at).toLocaleString()}
        </Typography>
        {session.closed_at && (
          <Typography>
            Closed At: {new Date(session.closed_at).toLocaleString()}
          </Typography>
        )}
      </Paper>
      <SessionConfigModal
        open={configOpen}
        onClose={handleCloseConfig}
        onCreate={handleCreateSession}
      />
    </Container>
  );
}
