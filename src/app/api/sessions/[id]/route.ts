import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await authenticateUser(request.headers.get('authorization'));
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
