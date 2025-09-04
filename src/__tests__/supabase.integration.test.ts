import { supabase } from '@/lib/supabase';

describe('Supabase integration', () => {
  it('should connect and fetch current timestamp', async () => {
    const { data, error } = await supabase.rpc('now');
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
