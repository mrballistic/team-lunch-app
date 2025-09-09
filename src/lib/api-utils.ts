// API utility functions and error handling
import { NextResponse } from 'next/server';
// Ensure supabaseAdmin is exported from './supabase'
import { supabaseAdmin } from './supabase';
// If the export is named differently, update the import accordingly:
// import { correctExportName as supabaseAdmin } from './supabase';

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status }
  );
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

export async function authenticateUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

export async function checkTeamMembership(
  teamId: string,
  userId: string,
  requiredRole?: 'owner' | 'member'
) {
  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single();

  if (!membership) {
    throw new Error('NOT_MEMBER');
  }

  if (requiredRole && membership.role !== requiredRole) {
    throw new Error('INSUFFICIENT_ROLE');
  }

  return membership;
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return createErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
      case 'NOT_MEMBER':
        return createErrorResponse('FORBIDDEN', 'Not a member of this team', 403);
      case 'INSUFFICIENT_ROLE':
        return createErrorResponse('FORBIDDEN', 'Insufficient permissions', 403);
      default:
        return createErrorResponse('INTERNAL_ERROR', 'Internal server error', 500);
    }
  }

  return createErrorResponse('INTERNAL_ERROR', 'Internal server error', 500);
}
