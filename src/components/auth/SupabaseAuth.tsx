"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
// Use the team ID from environment variable
const TEAM_ID = process.env.NEXT_PUBLIC_PUBLIC_TEAM_ID;
import { Box, TextField, Button, Typography, Paper, useTheme } from '@mui/material';

export default function SupabaseAuth() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let result;
      if (mode === 'sign-in') {
        result = await supabase.auth.signInWithPassword({ email, password });
        // If sign-in succeeded, upsert user into team_members
        if (!result.error && result.data.user) {
          await supabase.from('team_members').upsert([
            { team_id: TEAM_ID, user_id: result.data.user.id, role: 'member' }
          ], { onConflict: 'team_id,user_id' });
        }
      } else {
        result = await supabase.auth.signUp({ email, password });
        // If sign-up succeeded, upsert user into team_members
        if (!result.error && result.data.user) {
          await supabase.from('team_members').upsert([
            { team_id: TEAM_ID, user_id: result.data.user.id, role: 'member' }
          ], { onConflict: 'team_id,user_id' });
        }
      }
      if (result.error) setError(result.error.message);
      else window.location.href = `/team/${TEAM_ID}`;
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
