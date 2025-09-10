
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabase) return supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let supabaseAnonKey = '';
  if (typeof window === 'undefined') {
    // Server-side: use SUPABASE_ANON_KEY, fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  } else {
    // Client-side: only NEXT_PUBLIC_SUPABASE_ANON_KEY is available
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('supabaseKey is required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local.');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

export function getSupabaseAdminClient() {
  if (supabaseAdmin) return supabaseAdmin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Service role key or Supabase URL missing.');
  }
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return supabaseAdmin;
}


