'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TeamMembers from '@/components/teams/TeamMembers';
import RecentSessions from '@/components/teams/RecentSessions';
import TeamHistory from '@/components/teams/TeamHistory';
import ReviewDialog from '@/components/teams/ReviewDialog';
import DietarySettings from '@/components/teams/DietarySettings';

interface TeamData {
  id: string;
  name: string;
  defaultLocation: {
    lat: number;
    lng: number;
  };
  members: Array<{
    user: {
      id: string;
      email: string;
      name: string | null;
      avatar_url: string | null;
    };
    role: 'owner' | 'member';
    dietary: Record<string, boolean>;
    joinedAt: string;
  }>;
  recentSessions: Array<{
    id: string;
    status: 'draft' | 'open' | 'closed';
    created_at: string;
    closed_at: string | null;
  }>;
  history?: Array<{
    id: string;
    date: string;
    restaurant: string;
    rating: number | null;
    review: string | null;
  }>;
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setTeamId(id);
      if (user && session) {
        loadTeamData(id, session.access_token);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user, session]);

  const loadTeamData = async (id: string, accessToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/teams/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load team data');
      }
      const teamData = await response.json();
      setTeam(teamData);
    } catch (err) {
      console.error('Error loading team:', err);
      setError('Failed to load team data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setAddDialogOpen(true);
    setAddEmail('');
    setAddError(null);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setAddEmail('');
    setAddError(null);
    setAddLoading(false);
  };

  const handleAddDialogSubmit = async () => {
    if (!addEmail.trim()) {
      setAddError('Email is required');
      return;
    }
    if (!session) {
      setAddError('Not authenticated');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: addEmail })
      });
      if (!response.ok) {
        const err = await response.json();
        setAddError(err?.error?.message || 'Failed to add member');
        setAddLoading(false);
        return;
      }
      handleAddDialogClose();
      // Reload team data to show new member
      if (teamId) loadTeamData(teamId, session.access_token);
    } catch (err) {
      console.error('Add member error:', err);
      setAddError('Failed to add member. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!teamId || !session) return;
    try {
      const response = await fetch(`/api/teams/${teamId}/members?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err?.error?.message || 'Failed to remove member');
        return;
      }
      // Reload team data to reflect removal
      loadTeamData(teamId, session.access_token);
    } catch (err) {
      console.error('Remove member error:', err);
      setError('Failed to remove member. Please try again.');
    }
  };

  const handleViewSession = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  const handleCreateSession = () => {
    // TODO: Implement create session
    console.log('Create session clicked');
  };

  // Example: Open review dialog after a session (replace with real trigger)
  // useEffect(() => {
  //   if (team && team.recentSessions.length > 0 && !reviewDialogOpen) {
  //     setReviewDialogOpen(true);
  //   }
  // }, [team]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!session || !teamId) return;
    setReviewLoading(true);
    try {
      // For demo: submit review for the most recent session/restaurant
      const lastSession = team?.recentSessions?.[0];
      if (!lastSession) return;
      const response = await fetch(`/api/teams/${teamId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sessionId: lastSession.id,
          rating,
          comment
        })
      });
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      setReviewDialogOpen(false);
      // Optionally reload team data to show new review
      if (teamId) loadTeamData(teamId, session.access_token);
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading team...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => teamId && session && loadTeamData(teamId, session.access_token)} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Team not found</Alert>
      </Container>
    );
  }

  const currentUserMember = user ? team.members.find(m => m.user.id === user.id) : undefined;
  const isOwner = currentUserMember?.role === 'owner';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            {team.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {team.members.length} members • Office location: {team.defaultLocation.lat.toFixed(4)}, {team.defaultLocation.lng.toFixed(4)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RestaurantMenu />}
          onClick={handleCreateSession}
          size="large"
        >
          Start Lunch Session
        </Button>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        <Box flex={2} minWidth={0}>
          <TeamMembers
            members={team.members}
            currentUserId={user?.id || ''}
            isOwner={isOwner}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
          {/* Dietary Settings for current user */}
          {user && session && teamId && (
            <Box mt={3}>
              <DietarySettings
                teamId={teamId}
                accessToken={session.access_token}
                onUpdated={() => teamId && loadTeamData(teamId, session.access_token)}
              />
            </Box>
          )}
          <Box mt={3}>
            <TeamHistory history={team.history || []} />
          </Box>
        </Box>
        <Box flex={1} minWidth={0}>
          <RecentSessions
            sessions={team.recentSessions}
            onViewSession={handleViewSession}
          />
        </Box>
      </Box>

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose}>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User Email"
            type="email"
            fullWidth
            value={addEmail}
            onChange={e => setAddEmail(e.target.value)}
            disabled={addLoading}
            aria-label="User email to add"
          />
          {addError && (
            <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} disabled={addLoading}>Cancel</Button>
          <Button onClick={handleAddDialogSubmit} disabled={addLoading} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        onSubmit={handleReviewSubmit}
        loading={reviewLoading}
      />
    </Container>
  );
}
