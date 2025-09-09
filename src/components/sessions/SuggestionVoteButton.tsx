import React from 'react';
import { Button } from '@mui/material';

interface SuggestionVoteButtonProps {
  suggestionId: string;
  sessionId: string;
  onVoted: () => void;
}

const SuggestionVoteButton: React.FC<SuggestionVoteButtonProps> = ({ suggestionId, sessionId, onVoted }) => {
  const [loading, setLoading] = React.useState(false);

  const handleVote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggestionId }),
      });
      if (res.ok) {
        onVoted();
      }
      // Optionally handle error UI here if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVote}
      disabled={loading}
      variant="outlined"
      size="small"
      sx={{ ml: 1 }}
      aria-label={loading ? 'Voting for suggestion' : 'Vote for suggestion'}
    >
      {loading ? 'Voting...' : 'Vote'}
    </Button>
  );
};

export default SuggestionVoteButton;
