interface Suggestion {
  id: string;
  label: string;
  type: string;
  external_ref?: {
    categories?: string[];
    coords?: { lat: number; lng: number };
  };
  votes?: number;
  dietaryFit?: boolean;
  distanceMin?: number;
  lastVisitedAt?: string;
  reviewCount?: number;
  busyness?: number;
}

import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { getDistanceProxy } from '@/lib/distance-proxy';
import { searchYelp } from '@/lib/external-apis';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string}>}
) {
  try {
    const { id: sessionId } = await context.params;
    await authenticateUser(request.headers.get('authorization'));
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error: suggestionsError } = await supabaseAdmin
      .from('suggestions')
      .select('*')
      .eq('session_id', sessionId);
    const suggestions: Suggestion[] = (data ?? []) as Suggestion[];
    if (suggestionsError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to fetch suggestions', 500);
    }

    // Get session to find team location
  const { data: session } = await supabaseAdmin
      .from('lunch_sessions')
      .select('team_id')
      .eq('id', sessionId)
      .single();
    let teamLocation: { lat: number; lng: number } | null = null;
    if (session) {
  const { data: team } = await supabaseAdmin
        .from('teams')
        .select('default_location_lat, default_location_lng')
        .eq('id', session.team_id)
        .single();
      if (team) {
        teamLocation = {
          lat: team.default_location_lat,
          lng: team.default_location_lng
        };
      }
    }

    // Get team dietary restrictions
    let dietaryRestrictions: string[] = [];
    if (session) {
  const { data: teamMembers } = await supabaseAdmin
        .from('team_members')
        .select('dietary_restrictions')
        .eq('team_id', session.team_id);
      if (teamMembers) {
        dietaryRestrictions = teamMembers
          .flatMap((m: { dietary_restrictions?: string[] }) => m.dietary_restrictions || [])
          .filter((v: string, i: number, arr: string[]) => v && arr.indexOf(v) === i);
      }
    }

    // Mark dietary fit for each suggestion
    for (const suggestion of suggestions) {
      if (dietaryRestrictions.length && suggestion.external_ref?.categories) {
        // Simple check: if any restriction matches a category, mark as not fit
        const categories = suggestion.external_ref.categories.map((c: string) => c.toLowerCase());
        const notFit = dietaryRestrictions.some((r: string) => categories.includes(r.toLowerCase()));
        suggestion.dietaryFit = !notFit;
      } else {
        suggestion.dietaryFit = true;
      }
    }
    // Calculate walking time for each suggestion with coords
    if (teamLocation) {
      for (const suggestion of suggestions) {
        const coords = suggestion.external_ref?.coords;
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          const min = await getDistanceProxy(teamLocation, coords);
          suggestion.distanceMin = typeof min === 'number' ? min : undefined;
        }
      }
    }
    // Get votes for ranking
  const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('suggestion_id')
      .eq('session_id', sessionId);
    const voteCounts: Record<string, number> = {};
    if (votes) {
      votes.forEach((v: { suggestion_id: string }) => {
        voteCounts[v.suggestion_id] = (voteCounts[v.suggestion_id] || 0) + 1;
      });
    }
    // Attach vote count to suggestions
    for (const suggestion of suggestions) {
      suggestion.votes = voteCounts[suggestion.id] || 0;
    }

    // Sort suggestions: dietary fit > votes > walking time
    suggestions.sort((a, b) => {
      // Dietary fit first
      if (a.dietaryFit !== b.dietaryFit) return a.dietaryFit ? -1 : 1;
      // More votes first
      if ((b.votes ?? 0) !== (a.votes ?? 0)) return (b.votes ?? 0) - (a.votes ?? 0);
      // Shorter walk first
      if ((a.distanceMin ?? Infinity) !== (b.distanceMin ?? Infinity)) return (a.distanceMin ?? Infinity) - (b.distanceMin ?? Infinity);
      return 0;
    });

    // Attach busyness estimation (demo: random value)
    for (const suggestion of suggestions) {
      suggestion.busyness = Math.floor(Math.random() * 100);
    }
    return createSuccessResponse(suggestions);
    } catch (error) {
      return handleApiError(error);
    }
  }


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string}> }
): Promise<Response> {
  try {
    const { id: sessionId } = await context.params;
    const body = await request.json();
    const { type, label } = body;
    if (!type || !label) {
      return createErrorResponse('MISSING_FIELDS', 'type and label are required', 400);
    }
  const user = await authenticateUser(request.headers.get('authorization'));
  const supabaseAdmin = getSupabaseAdminClient();
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
            const { businesses } = await searchYelp(label, team.default_location_lat, team.default_location_lng, 5);
            expanded = businesses;
          }
        }
      }
      
      // Create the suggestion
  const { data, error } = await supabaseAdmin
        .from('suggestions')
        .insert({
          session_id: sessionId,
          created_by: user.id,
          type,
          label,
          external_ref: expanded ? { businesses: expanded } : undefined
        })
        .select()
        .single();
  
      if (error) {
        return createErrorResponse('DATABASE_ERROR', 'Failed to create suggestion', 500);
      }
  
      return createSuccessResponse(data);
    } catch (error) {
      return handleApiError(error);
    }
  }
