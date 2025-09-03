import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';
import { Database } from '@/types/database';

type SessionInsert = Database['public']['Tables']['lunch_sessions']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, maxWalkMinutes, priceMin, priceMax, cooldownDays } = body;
    if (!teamId) {
      return createErrorResponse('MISSING_FIELDS', 'teamId is required', 400);
    }
    const user = await authenticateUser(request.headers.get('authorization'));
    const sessionData: SessionInsert = {
      team_id: teamId,
      max_walk_minutes: maxWalkMinutes ?? null,
      price_min: priceMin ?? null,
      price_max: priceMax ?? null,
      cooldown_days: cooldownDays ?? null,
      created_by: user.id
    };
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('lunch_sessions')
      .insert(sessionData)
      .select()
      .single();
    if (sessionError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to create session', 500);
    }
    return createSuccessResponse({
      id: session.id,
      status: session.status,
      ...session
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action } = body;
    if (!sessionId || !action) {
      return createErrorResponse('MISSING_FIELDS', 'sessionId and action are required', 400);
    }
    const user = await authenticateUser(request.headers.get('authorization'));
    let updateData = {};
    if (action === 'open') {
      updateData = { status: 'open' };
    } else if (action === 'close') {
      updateData = { status: 'closed', closed_at: new Date().toISOString() };
    } else {
      return createErrorResponse('INVALID_ACTION', 'Unknown action', 400);
    }
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('lunch_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();
    if (sessionError) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to update session', 500);
    }
    return createSuccessResponse(session);
  } catch (error) {
    return handleApiError(error);
  }
}
