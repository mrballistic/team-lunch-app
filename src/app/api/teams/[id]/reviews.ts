import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await context.params;
    const body = await request.json();
    const { sessionId, rating, comment } = body;

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdminClient();

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authorization header required' } },
        { status: 401 }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // Find restaurant for session (simplified: get first suggestion with type 'restaurant')
    const { data: suggestion } = await supabaseAdmin
      .from('suggestions')
      .select('id, external_ref')
      .eq('session_id', sessionId)
      .eq('type', 'restaurant')
      .limit(1)
      .single();

    const restaurantId = suggestion?.external_ref?.yelp_id || null;

    // Insert review
    const { error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        team_id: teamId,
        restaurant_id: restaurantId,
        user_id: user.id,
        rating,
        comment
      });
    if (reviewError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to submit review' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/teams/[id]/reviews:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
