import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params;
    const body = await request.json();
    const { suggestionId } = body;
    if (!suggestionId) {
      return createErrorResponse('MISSING_FIELDS', 'suggestionId is required', 400);
    }
    const user = await authenticateUser(request.headers.get('authorization'));
    // Upsert vote (idempotent, last write wins)
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .upsert({
        session_id: sessionId,
        suggestion_id: suggestionId,
        user_id: user.id,
        weight: 1
      }, { onConflict: 'session_id,user_id' });
    if (voteError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to cast vote', 500);
    }
    // Get updated tally
    const { data: votes, error: tallyError } = await supabaseAdmin
      .from('votes')
      .select('suggestion_id')
      .eq('session_id', sessionId);
    if (tallyError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to fetch tally', 500);
    }
    // Aggregate tally
    const tally: Record<string, number> = {};
    votes.forEach(v => {
      tally[v.suggestion_id] = (tally[v.suggestion_id] || 0) + 1;
    });
    return createSuccessResponse({ userId: user.id, suggestionId, tally });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params;
    // Get all votes and tally
    const { data: votes, error: votesError } = await supabaseAdmin
      .from('votes')
      .select('user_id, suggestion_id')
      .eq('session_id', sessionId);
    if (votesError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to fetch votes', 500);
    }
    // Tally votes
    const tally: Record<string, number> = {};
    votes.forEach(v => {
      tally[v.suggestion_id] = (tally[v.suggestion_id] || 0) + 1;
    });
    return createSuccessResponse({ votes, tally });
  } catch (error) {
    return handleApiError(error);
  }
}
