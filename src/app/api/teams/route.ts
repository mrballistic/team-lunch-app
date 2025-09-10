import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { Database } from '@/types/database';
import { authenticateUser, createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils';

type TeamInsert = Database['public']['Tables']['teams']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, defaultLocation } = body;

    if (!name || !defaultLocation?.lat || !defaultLocation?.lng) {
      return createErrorResponse('MISSING_FIELDS', 'Name and defaultLocation are required', 400);
    }

  const user = await authenticateUser(request.headers.get('authorization'));
  const supabaseAdmin = getSupabaseAdminClient();

    // Create team
    const teamData: TeamInsert = {
      name,
      default_location_lat: defaultLocation.lat,
      default_location_lng: defaultLocation.lng
    };

    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert(teamData)
      .select()
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return createErrorResponse('DATABASE_ERROR', 'Failed to create team', 500);
    }

    // Add creator as team owner
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) {
      console.error('Error adding team owner:', memberError);
      // Clean up team if member creation fails
      await supabaseAdmin.from('teams').delete().eq('id', team.id);
      return createErrorResponse('DATABASE_ERROR', 'Failed to set team ownership', 500);
    }

    return createSuccessResponse({
      id: team.id,
      name: team.name,
      defaultLocation: {
        lat: team.default_location_lat,
        lng: team.default_location_lng
      }
    }, 201);

  } catch (error) {
    return handleApiError(error);
  }
}
