import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material';

interface Suggestion {
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

interface SuggestionCardProps {
  suggestion: Suggestion;
  onVote: (suggestionId: string) => void;
  votes?: number;
}

export default function SuggestionCard({ suggestion, onVote, votes }: SuggestionCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" aria-label={`Suggestion: ${suggestion.label}`}>
              {suggestion.label}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={suggestion.type} size="small" color={suggestion.type === 'restaurant' ? 'primary' : 'default'} />
              {suggestion.priceTier && <Chip label={`$`.repeat(suggestion.priceTier)} size="small" />}
              {suggestion.distanceMin && <Chip label={`${suggestion.distanceMin} min walk`} size="small" />}
              {suggestion.dietaryFit === false && <Chip label="Doesn't fit dietary" color="error" size="small" />}
              {suggestion.dietaryFit === true && <Chip label="Dietary fit" color="success" size="small" />}
              {suggestion.lastVisitedAt && <Chip label={`Last visited: ${new Date(suggestion.lastVisitedAt).toLocaleDateString()}`} size="small" />}
            </Box>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Votes
            </Typography>
            <Typography variant="h5" color="primary">
              {votes ?? 0}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => onVote(suggestion.id)}
              sx={{ mt: 1 }}
              aria-label={`Vote for ${suggestion.label}`}
            >
              Vote
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
