import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const user = await authenticateUser(request.headers.get('authorization'));
    const { data: suggestions, error: suggestionsError } = await supabaseAdmin
      .from('suggestions')
      .select('*')
      .eq('session_id', sessionId);
    if (suggestionsError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to fetch suggestions', 500);
    }
    return createSuccessResponse(suggestions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { type, label } = body;
    if (!type || !label) {
      return createErrorResponse('MISSING_FIELDS', 'type and label are required', 400);
    }
    const user = await authenticateUser(request.headers.get('authorization'));
    let expanded = undefined;
    if (type === 'style') {
      // Get session to find team location
      const { data: session } = await supabaseAdmin
        .from('lunch_sessions')
        .select('team_id')
        .eq('id', sessionId)
        .single();
      if (session) {
        const { data: team } = await supabaseAdmin
          .from('teams')
          .select('default_location_lat, default_location_lng')
          .eq('id', session.team_id)
          .single();
        if (team) {
          // Yelp search for style near office
          const { businesses } = await import('@/lib/external-apis').then(m => m.searchYelp(label, team.default_location_lat, team.default_location_lng, 5));
          expanded = businesses;
        }
      }
    }
    // Insert suggestion
    const suggestionData = {
      session_id: sessionId,
      type,
      label,
      created_by: user.id,
      external_ref: expanded ? expanded : null
    };
    const { data: suggestion, error: suggestionError } = await supabaseAdmin
      .from('suggestions')
      .insert(suggestionData)
      .select()
      .single();
    if (suggestionError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to create suggestion', 500);
    }
    return createSuccessResponse({ suggestion, expanded });
  } catch (error) {
    return handleApiError(error);
  }
}
