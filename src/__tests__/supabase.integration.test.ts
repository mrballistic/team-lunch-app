import { getSupabaseClient } from '@/lib/supabase';

describe('Supabase integration', () => {
  it('should connect and fetch current timestamp', async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('now');
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
