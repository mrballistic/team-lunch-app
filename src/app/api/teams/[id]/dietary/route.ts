import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';

// PATCH /api/teams/[id]/dietary
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamId = params.id;
    const supabaseAdmin = getSupabaseAdminClient();
    const user = await authenticateUser(request.headers.get('authorization'));
    const body = await request.json();
    const { dietary } = body;
    if (!dietary || typeof dietary !== 'object') {
      return createErrorResponse('BAD_REQUEST', 'Missing or invalid dietary settings', 400);
    }
    const { error } = await supabaseAdmin
      .from('team_members')
      .update({ dietary })
      .eq('team_id', teamId)
      .eq('user_id', user.id);
    if (error) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to update dietary settings', 500);
    }
    return createSuccessResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/teams/[id]/dietary (for current user)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamId = params.id;
    const supabaseAdmin = getSupabaseAdminClient();
    const user = await authenticateUser(request.headers.get('authorization'));
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('dietary')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();
    if (error) {
      return createErrorResponse('DATABASE_ERROR', 'Failed to fetch dietary settings', 500);
    }
    // If no row found, return empty object
    if (!data) {
      return createSuccessResponse({});
    }
    return createSuccessResponse(data.dietary ?? {});
  } catch (error) {
    return handleApiError(error);
  }
}
