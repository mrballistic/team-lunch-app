
'use client';
import React from 'react';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import SuggestionSearchBar from '@/components/sessions/SuggestionSearchBar';
import SuggestionsList from '@/components/sessions/SuggestionsList';
import VoteTallyPanel, { VoteTally } from '@/components/sessions/VoteTallyPanel';

interface Suggestion {
  name?: string; // for VoteTallyPanel compatibility
  id: string;
  type: 'restaurant' | 'style';
  label: string;
  external_ref?: {
    yelp_id?: string;
    categories?: string[];
    coords?: { lat: number; lng: number };
    price_tier?: number;
    url?: string;
    [key: string]: unknown;
  };
  votes?: number;
  priceTier?: number;
  distanceMin?: number;
  dietaryFit?: boolean;
  lastVisitedAt?: string;
}

export default function SessionSuggestions({ params }: { params: { id: string } }) {
  const [tally, setTally] = useState<VoteTally>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTally = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/votes`, {
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
  }, [params.id]);

  const loadSuggestions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual auth token
      const response = await fetch(`/api/sessions/${params.id}/suggestions`, {
        headers: {
          'Authorization': 'Bearer temp-token'
        }
      });
      if (!response.ok) throw new Error('Failed to load suggestions');
      const data = await response.json();
      setSuggestions(data);
      // Fetch tally after suggestions
      await loadTally();
    } catch {
      setError('Failed to load suggestions.');
    } finally {
      setLoading(false);
    }
  }, [params.id, loadTally]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      await loadSuggestions();
    };
    fetchSuggestions();
  }, [params.id, loadSuggestions]);

  const handleSuggest = async (type: 'restaurant' | 'style', label: string) => {
    // TODO: Replace with actual auth token
    const response = await fetch(`/api/sessions/${params.id}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer temp-token'
      },
      body: JSON.stringify({ type, label })
    });
    if (response.ok) {
      loadSuggestions();
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer temp-token'
        },
        body: JSON.stringify({ suggestionId })
      });
      if (response.ok) {
        await loadTally();
      }
    } catch {
      // Optionally handle error UI
    }
  };

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>Suggestions</Typography>
      <SuggestionSearchBar onSuggest={handleSuggest} />
  <SuggestionsList suggestions={suggestions} onVote={handleVote} tally={tally} />
      <VoteTallyPanel
        tally={tally}
        suggestions={suggestions.map(s => ({ id: s.id, name: s.label || s.name || 'Unknown' }))}
      />
    </Box>
  );
}
