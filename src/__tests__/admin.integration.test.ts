import { getSupabaseAdminClient } from '@/lib/supabase';

describe('Supabase admin integration', () => {
  it('should fetch all users with the service role key', async () => {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.from('users').select('*');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    console.log('Users:', data);
  });
});
