import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';

// Ranking function: dietary fit > votes > walk time > price > random tie-breaker
interface Suggestion {
  id: string;
  label: string;
  type: 'restaurant' | 'style';
  dietaryFit?: boolean;
  votes?: number;
  distanceMin?: number;
  priceTier?: number;
  [key: string]: unknown;
}

function rankSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return suggestions
    .map(s => ({ ...s, _rand: Math.random() }))
    .sort((a, b) => {
      // Dietary fit first
      if (a.dietaryFit !== b.dietaryFit) return a.dietaryFit ? -1 : 1;
      // More votes first
      if ((b.votes ?? 0) !== (a.votes ?? 0)) return (b.votes ?? 0) - (a.votes ?? 0);
      // Shorter walk first
      if ((a.distanceMin ?? Infinity) !== (b.distanceMin ?? Infinity)) return (a.distanceMin ?? Infinity) - (b.distanceMin ?? Infinity);
      // Lower price first
      if ((a.priceTier ?? Infinity) !== (b.priceTier ?? Infinity)) return (a.priceTier ?? Infinity) - (b.priceTier ?? Infinity);
      // Random tie-breaker
      return (a._rand as number) - (b._rand as number);
    });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await context.params;
    await authenticateUser(request.headers.get('authorization'));
    // Get all suggestions for this session
    const { data: suggestions, error } = await supabaseAdmin
      .from('suggestions')
      .select('*')
      .eq('session_id', sessionId);
    if (error) return createErrorResponse('DATABASE_ERROR', 'Failed to fetch suggestions', 500);
    // Get votes
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('suggestion_id')
      .eq('session_id', sessionId);
    const voteCounts: Record<string, number> = {};
    if (votes) votes.forEach((v: { suggestion_id: string }) => {
      voteCounts[v.suggestion_id] = (voteCounts[v.suggestion_id] || 0) + 1;
    });
    // Attach votes
  suggestions.forEach((s: Suggestion) => { s.votes = voteCounts[s.id] || 0; });
    // TODO: Attach dietaryFit, distanceMin, priceTier as needed
    const ranked = rankSuggestions(suggestions);
    return createSuccessResponse({ ranked, winner: ranked[0] || null });
  } catch (error) {
    return handleApiError(error);
  }
}
