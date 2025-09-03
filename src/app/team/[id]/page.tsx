'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import TeamMembers from '@/components/teams/TeamMembers';
import RecentSessions from '@/components/teams/RecentSessions';

interface TeamPageProps {
  params: { id: string };
}

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

export default function TeamPage({ params }: TeamPageProps) {
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId] = useState('temp-user-id'); // TODO: Get from auth context

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual auth token
        const response = await fetch(`/api/teams/${params.id}`, {
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

    loadData();
  }, [params.id]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual auth token
      const response = await fetch(`/api/teams/${params.id}`, {
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
    // TODO: Implement add member dialog
    console.log('Add member clicked');
  };

  const handleRemoveMember = async (userId: string) => {
    // TODO: Implement remove member
    console.log('Remove member:', userId);
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
        <Button onClick={loadTeamData} sx={{ mt: 2 }}>
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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TeamMembers
            members={team.members}
            currentUserId={currentUserId}
            isOwner={isOwner}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <RecentSessions
            sessions={team.recentSessions}
            onViewSession={handleViewSession}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
