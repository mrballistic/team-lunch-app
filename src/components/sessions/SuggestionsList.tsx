import SuggestionCard from './SuggestionCard';

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

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onVote: (suggestionId: string) => void;
  tally?: Record<string, number>;
}

export default function SuggestionsList({ suggestions, onVote, tally }: SuggestionsListProps) {
  return (
    <div>
      {suggestions.length === 0 ? (
        <p>No suggestions yet. Be the first to suggest!</p>
      ) : (
        suggestions.map(suggestion => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onVote={onVote}
            votes={typeof tally === 'object' ? tally[suggestion.id] ?? 0 : suggestion.votes ?? 0}
          />
        ))
      )}
    </div>
  );
}
