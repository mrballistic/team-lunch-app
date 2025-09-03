import React from 'react';

export interface VoteTally {
  [suggestionId: string]: number;
}

interface VoteTallyPanelProps {
  tally: VoteTally;
  suggestions: Array<{ id: string; name: string }>;
}

const VoteTallyPanel: React.FC<VoteTallyPanelProps> = ({ tally, suggestions }) => {
  return (
    <div style={{ marginTop: 24 }}>
      <h3>Live Vote Tally</h3>
      <ul>
        {suggestions.map(suggestion => (
          <li key={suggestion.id}>
            <strong>{suggestion.name}</strong>: {tally[suggestion.id] || 0} votes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoteTallyPanel;
