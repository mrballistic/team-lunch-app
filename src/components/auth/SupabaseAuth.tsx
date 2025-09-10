"use client";
import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

import { Box, TextField, Button, Typography, Paper, useTheme } from '@mui/material';

export default function SupabaseAuth() {
  const TEAM_ID = process.env.NEXT_PUBLIC_PUBLIC_TEAM_ID;
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const supabase = getSupabaseClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let result;
      if (mode === 'sign-in') {
        result = await supabase.auth.signInWithPassword({ email, password });
        console.log('Sign-in result:', result);
        if (result.error) {
          setError('Sign-in error: ' + result.error.message);
          return;
        }
        if (result.data && result.data.user) {
          // Insert user into custom users table (if not exists)
          // Log auth.uid() via a select to confirm session context
          const { data: authUser } = await supabase.rpc('get_my_uid');
          console.log('auth.uid() from RPC:', authUser);
          console.log('Attempting to insert user:', { id: result.data.user.id, email });
          const { error: userInsertError } = await supabase.from('users').upsert([
            { id: result.data.user.id, email }
          ], { onConflict: 'id' });
          if (userInsertError) {
            console.error('Failed to insert user:', userInsertError);
            setError('Failed to create user: ' + userInsertError.message);
            return;
          }
          // Now upsert into team_members
          const { error: upsertError } = await supabase.from('team_members').upsert([
            { team_id: TEAM_ID, user_id: result.data.user.id, role: 'member' }
          ], { onConflict: 'team_id,user_id' });
          if (upsertError) {
            console.error('Failed to upsert team_members:', upsertError);
            setError('Failed to join team: ' + upsertError.message);
            return;
          }
        } else {
          setError('No user returned from sign-in.');
          return;
        }
        window.location.href = `/team/${TEAM_ID}`;
      } else {
        result = await supabase.auth.signUp({ email, password });
        console.log('Sign-up result:', result);
        if (result.error) {
          setError('Sign-up error: ' + result.error.message);
          return;
        }
        // After sign-up, sign in to get a session
        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        console.log('Sign-in after sign-up result:', signInResult);
        if (signInResult.error) {
          setError('Sign-in error after sign-up: ' + signInResult.error.message);
          return;
        }
        if (signInResult.data && signInResult.data.user) {
          // Insert user into custom users table (if not exists)
          // Log auth.uid() via a select to confirm session context
          const { data: authUser } = await supabase.rpc('get_my_uid');
          console.log('auth.uid() from RPC:', authUser);
          console.log('Attempting to insert user:', { id: signInResult.data.user.id, email });
          const { error: userInsertError } = await supabase.from('users').upsert([
            { id: signInResult.data.user.id, email }
          ], { onConflict: 'id' });
          if (userInsertError) {
            console.error('Failed to insert user:', userInsertError);
            setError('Failed to create user: ' + userInsertError.message);
            return;
          }
          // Now upsert into team_members
          const { error: upsertError } = await supabase.from('team_members').upsert([
            { team_id: TEAM_ID, user_id: signInResult.data.user.id, role: 'member' }
          ], { onConflict: 'team_id,user_id' });
          if (upsertError) {
            console.error('Failed to upsert team_members:', upsertError);
            setError('Failed to join team: ' + upsertError.message);
            return;
          }
        } else {
          setError('No user returned from sign-in after sign-up.');
          return;
        }
        window.location.href = `/team/${TEAM_ID}`;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 4 },
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
      }}
    >
      <Typography variant="h5" gutterBottom>
        {mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
      </Typography>
      <Box
        component="form"
        onSubmit={handleAuth}
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ mt: 2 }}
      >
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 1 }}>
          {loading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </Button>
        <Button onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} sx={{ mt: 1 }}>
          {mode === 'sign-in' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Button>
      </Box>
    </Paper>
  );
}
