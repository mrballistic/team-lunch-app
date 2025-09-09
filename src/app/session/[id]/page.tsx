'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import SuggestionSearchBar from '@/components/sessions/SuggestionSearchBar';
import SuggestionsList from '@/components/sessions/SuggestionsList';
import VoteTallyPanel, { VoteTally } from '@/components/sessions/VoteTallyPanel';

interface Session {
  id: string;
  team_id: string;
  status: 'draft' | 'open' | 'closed';
  max_walk_minutes: number | null;
  price_min: number | null;
  price_max: number | null;
  cooldown_days: number | null;
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SessionPage({ params }: any) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  interface Suggestion {
    id: string;
    label: string;
    type: 'restaurant' | 'style';
    external_ref?: {
      yelp_id?: string;
      categories?: string[];
      coords?: { lat: number; lng: number };
      price_tier?: number;
      url?: string;
    };
    votes?: number;
    priceTier?: number;
    distanceMin?: number;
    dietaryFit?: boolean;
    lastVisitedAt?: string;
  }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [tally, setTally] = useState<VoteTally>({});
  // ...existing code...
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  // ...existing code...

  useEffect(() => {
    const { id } = params;
    setSessionId(id);
    loadSession(id);
    loadSuggestions(id);
    loadTally(id);
  }, [params]);

  // ...existing code...

  // (rest of the file unchanged)

  const loadSuggestions = async (id: string) => {
    try {
      setSuggestionError(null);
      const response = await fetch(`/api/sessions/${id}/suggestions`, {
        headers: {
          'Authorization': 'Bearer temp-token'
        }
      });
      if (!response.ok) throw new Error('Failed to load suggestions');
      setSuggestions(await response.json());
    } catch (error) {
      console.error('Load suggestions error:', error);
      setSuggestionError('Failed to load suggestions.');
    }
  };

  const loadTally = async (id: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}/votes`, {
        headers: {
          'Authorization': 'Bearer temp-token'
        }
      });
      if (!response.ok) throw new Error('Failed to load tally');
      const data = await response.json();
      setTally(data.tally || {});
    } catch {
      setTally({});
    }
  };
  const handleSuggest = async (type: 'restaurant' | 'style', label: string) => {
    if (!sessionId) return;
    setSuggestionError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer temp-token'
        },
        body: JSON.stringify({ type, label })
      });
      if (!response.ok) {
        const error = await response.json();
        setSuggestionError(error?.error?.message || 'Failed to add suggestion');
        return;
      }
      // Reload suggestions and tally after adding
      loadSuggestions(sessionId);
      loadTally(sessionId);
    } catch (error) {
      console.error('Add suggestion error:', error);
      setSuggestionError('Failed to add suggestion.');
    }
  };

  const handleVote = async (suggestionId: string) => {
    if (!sessionId) return;
    try {
      const response = await fetch(`/api/sessions/${sessionId}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer temp-token'
        },
        body: JSON.stringify({ suggestionId })
      });
      if (response.ok) {
        await loadTally(sessionId);
        await loadSuggestions(sessionId);
      }
    } catch {
      // Optionally handle error UI
    }
  };

  const loadSession = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
  // Replace with actual auth token in production
      const response = await fetch(`/api/sessions/${id}`, {
        headers: {
          'Authorization': 'Bearer temp-token'
        }
      });
      if (!response.ok) throw new Error('Failed to load session');
      setSession(await response.json());
    } catch (err) {
      console.error('Load session error:', err);
      setError('Failed to load session.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfig = () => setConfigOpen(true);
  const handleCloseConfig = () => setConfigOpen(false);
  const handleCreateSession = async (config: {
    maxWalkMinutes: number;
    priceMin: number;
    priceMax: number;
    cooldownDays: number;
  }) => {
    if (!session) return;
  // Removed setCreating (no longer used)
    setCreateError(null);
    try {
      // Replace with actual auth token and teamId in production
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer temp-token'
        },
        body: JSON.stringify({
          teamId: session.team_id,
          maxWalkMinutes: config.maxWalkMinutes,
          priceMin: config.priceMin,
          priceMax: config.priceMax,
          cooldownDays: config.cooldownDays
        })
      });
      if (!response.ok) {
        const err = await response.json();
  setCreateError(err?.error?.message || 'Failed to create session');
  return;
      }
      const newSession = await response.json();
  setConfigOpen(false);
  // Redirect to new session page
  router.push(`/session/${newSession.id}`);
    } catch (err) {
      console.error('Create session error:', err);
  setCreateError('Failed to create session. Please try again.');
    }
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
        <Button onClick={() => sessionId && loadSession(sessionId)} sx={{ mt: 2 }} aria-label="Retry loading session">
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
        <Button variant="contained" onClick={handleOpenConfig} aria-label="Open session configuration">
          Configure Session
        </Button>
      </Box>
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
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
        {createError && (
          <Alert severity="error" sx={{ mt: 2 }}>{createError}</Alert>
        )}
      </Paper>

      {/* Suggestion Search Bar */}
      <SuggestionSearchBar onSuggest={handleSuggest} />
      {suggestionError && (
        <Alert severity="error" sx={{ mb: 2 }}>{suggestionError}</Alert>
      )}
      <SuggestionsList suggestions={suggestions} onVote={handleVote} tally={tally} />
      <VoteTallyPanel
        tally={tally}
        suggestions={suggestions.map(s => ({ id: s.id, name: s.label || 'Unknown' }))}
      />

      <SessionConfigModal
        open={configOpen}
        onClose={handleCloseConfig}
        onCreate={handleCreateSession}
      />

      <Box mt={4} textAlign="center">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => sessionId && router.push(`/session/${sessionId}/results`)}
        >
          View Results
        </Button>
      </Box>
    </Container>
  );
}
