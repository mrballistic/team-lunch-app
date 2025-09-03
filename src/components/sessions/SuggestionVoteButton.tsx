import React from 'react';

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
    <button onClick={handleVote} disabled={loading} style={{ marginLeft: 8 }}>
      {loading ? 'Voting...' : 'Vote'}
    </button>
  );
};

export default SuggestionVoteButton;
