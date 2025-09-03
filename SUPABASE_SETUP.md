# Supabase Setup Instructions

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your Project URL and Project API keys

## 2. Set Up Database Schema
1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the SQL to create all tables and RLS policies

## 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your public anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for server-side operations)

## 4. Enable Email Authentication
1. In Supabase dashboard, go to Authentication > Settings
2. Enable Email authentication
3. Configure email templates if desired

## 5. Test Connection
Run the development server and verify the Supabase connection works.
