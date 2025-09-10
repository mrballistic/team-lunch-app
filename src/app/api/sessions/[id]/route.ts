import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return createErrorResponse('BAD_REQUEST', 'Session ID is required', 400);
    }
    await authenticateUser(request.headers.get('authorization'));
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('lunch_sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (sessionError || !session) {
      return createErrorResponse('NOT_FOUND', 'Session not found', 404);
    }
    return createSuccessResponse(session);
  } catch (error) {
    return handleApiError(error);
  }
}
