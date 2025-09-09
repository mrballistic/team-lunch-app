import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
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
  return createClient(supabaseUrl, supabaseAnonKey);
}

// For legacy usage, keep a default export (optional, can be removed if not needed)
export const supabase = getSupabaseClient();

// Server-side client with service role key for admin operations
export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Service role key or Supabase URL missing.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// For legacy usage, keep a default export (optional, can be removed if not needed)
export const supabaseAdmin = getSupabaseClient();

