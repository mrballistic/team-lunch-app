import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string}> }
) {
  try {
    const { id: teamId } = await context.params;

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

    // Check if user is a member of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not a member of this team' } },
        { status: 403 }
      );
    }

    // Get team details
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Team not found' } },
        { status: 404 }
      );
    }

    // Get team members with user details
    const { data: members, error: membersError } = await supabaseAdmin
      .from('team_members')
      .select(`
        role,
        dietary,
        created_at,
        users (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('team_id', teamId);

    if (membersError) {
      console.error('Error fetching team members:', membersError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch team members' } },
        { status: 500 }
      );
    }

    // Get recent sessions
    const { data: recentSessions, error: sessionsError } = await supabaseAdmin
      .from('lunch_sessions')
      .select('id, status, created_at, closed_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.error('Error fetching recent sessions:', sessionsError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch recent sessions' } },
        { status: 500 }
      );
    }

    // Get lunch history (last 10 sessions with restaurant, rating, review)
    const { data: historyRows, error: historyError } = await supabaseAdmin
      .from('lunch_sessions')
      .select(`
        id,
        created_at,
        restaurants: suggestions(label, external_ref),
        reviews: reviews(rating, comment, user_id, created_at)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching lunch history:', historyError);
    }

    // Map history to UI shape
    const history = (historyRows || []).map(session => {
      const restaurant = session.restaurants?.[0]?.label || 'Unknown';
      const review = session.reviews?.[0] || null;
      return {
        id: session.id,
        date: session.created_at,
        restaurant,
        rating: review?.rating ?? null,
        review: review?.comment ?? null
      };
    });

    return NextResponse.json({
      id: team.id,
      name: team.name,
      defaultLocation: {
        lat: team.default_location_lat,
        lng: team.default_location_lng
      },
      members: members.map(member => ({
        user: member.users,
        role: member.role,
        dietary: member.dietary,
        joinedAt: member.created_at
      })),
      recentSessions: recentSessions || [],
      history
    });

  } catch (error) {
    console.error('Error in GET /api/teams/[id]:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
