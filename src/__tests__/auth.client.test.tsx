/**
 * Basic smoke test for the SupabaseAuth component rendering.
 * This test is intentionally minimal and does not contact Supabase.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SupabaseAuth from '@/components/auth/SupabaseAuth';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock Next router used inside the component
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}));

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
    from: () => ({ upsert: jest.fn().mockResolvedValue({}) }),
    rpc: jest.fn().mockResolvedValue({ data: null }),
  })
}));

describe('SupabaseAuth component', () => {
  it('renders form fields', async () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <SupabaseAuth />
      </ThemeProvider>
    );
  expect(screen.getByLabelText(/Email/i)).toBeTruthy();
  expect(screen.getByLabelText(/Password/i)).toBeTruthy();
  });
});
