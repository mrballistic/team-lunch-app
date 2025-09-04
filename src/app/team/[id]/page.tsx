'use client';

import { useState, useEffect } from 'react';
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
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId] = useState('temp-user-id'); // TODO: Get from auth context
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setTeamId(id);
      loadTeamData(id);
    })();
  }, [params]);

  const loadTeamData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual auth token
      const response = await fetch(`/api/teams/${id}`, {
        headers: {
          'Authorization': 'Bearer temp-token'
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
    setAddLoading(true);
    setAddError(null);
    try {
      // TODO: Replace with actual auth token
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer temp-token'
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
      if (teamId) loadTeamData(teamId);
    } catch (err) {
      console.error('Add member error:', err);
      setAddError('Failed to add member. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!teamId) return;
    try {
      // TODO: Replace with actual auth token
      const response = await fetch(`/api/teams/${teamId}/members?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer temp-token'
        }
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err?.error?.message || 'Failed to remove member');
        return;
      }
      // Reload team data to reflect removal
      loadTeamData(teamId);
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

  if (loading) {
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
        <Button onClick={() => teamId && loadTeamData(teamId)} sx={{ mt: 2 }}>
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

  const currentUserMember = team.members.find(m => m.user.id === currentUserId);
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
            currentUserId={currentUserId}
            isOwner={isOwner}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
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
    </Container>
  );
}
