import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string}> }
) {
  try {
    const { id: teamId } = await context.params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'Email is required' } },
        { status: 400 }
      );
    }

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

    // Check if user is an owner of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only team owners can add members' } },
        { status: 403 }
      );
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar_url')
      .eq('email', email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User with this email not found' } },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', targetUser.id)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: { code: 'ALREADY_MEMBER', message: 'User is already a team member' } },
        { status: 400 }
      );
    }

    // Add user to team
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: targetUser.id,
        role: 'member'
      });

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to add team member' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teamId,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        avatar_url: targetUser.avatar_url
      }
    });

  } catch (error) {
    console.error('Error in POST /api/teams/[id]/members:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string}> }
) {
  try {
    const { id: teamId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'userId query parameter is required' } },
        { status: 400 }
      );
    }

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

    // Check if user is an owner of this team or removing themselves
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || (membership.role !== 'owner' && user.id !== userId)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only team owners can remove members, or users can remove themselves' } },
        { status: 403 }
      );
    }

    // Remove user from team
    const { error: removeError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (removeError) {
      console.error('Error removing team member:', removeError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to remove team member' } },
        { status: 500 }
      );
    }

    return NextResponse.json(null, { status: 204 });

  } catch (error) {
    console.error('Error in DELETE /api/teams/[id]/members:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
