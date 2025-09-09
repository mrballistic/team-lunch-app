import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

export interface VoteTally {
  [suggestionId: string]: number;
}

interface VoteTallyPanelProps {
  tally: VoteTally;
  suggestions: Array<{ id: string; name: string }>;
}

const VoteTallyPanel: React.FC<VoteTallyPanelProps> = ({ tally, suggestions }) => {
  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>Live Vote Tally</Typography>
      <List role="list" aria-live="polite">
        {suggestions.map(suggestion => (
          <ListItem key={suggestion.id} disablePadding>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontWeight="medium">{suggestion.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{tally[suggestion.id] || 0} votes</Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default VoteTallyPanel;
