import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  Box,
  IconButton
} from '@mui/material';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

interface TeamMember {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
  };
  role: 'owner' | 'member';
  dietary: Record<string, boolean>;
  joinedAt: string;
}


interface TeamMembersProps {
  members: TeamMember[];
  currentUserId: string;
  isOwner: boolean;
  onRemoveMember: (userId: string) => void;
  onAddMember?: () => void;
}

export default function TeamMembers({
  members,
  currentUserId,
  isOwner,
  onRemoveMember,
  onAddMember
}: TeamMembersProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Team Members ({members.length})
          </Typography>
          {isOwner && onAddMember && (
            <Button variant="outlined" size="small" onClick={onAddMember} sx={{ ml: 2 }}>
              Add
            </Button>
          )}
        </Box>
        {members.map((member, idx) => {
              const user = member.user;
              const userId = user?.id || `unknown-${idx}`;
              const userName = user?.name || user?.email || 'Unknown User';
              const userEmail = user?.email || '';
              const avatarUrl = user?.avatar_url || undefined;
              const avatarFallback = userName[0]?.toUpperCase() || '?';
              return (
                <Box
                  key={userId}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={1}
                  border={1}
                  borderColor="divider"
                  borderRadius={1}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={avatarUrl}
                      alt={userName}
                      aria-label={`Avatar for ${userName}`}
                    >
                      {avatarFallback}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {userName}
                      </Typography>
                      {user?.name && (
                        <Typography variant="body2" color="text.secondary">
                          {userEmail}
                        </Typography>
                      )}
                      <Box display="flex" gap={1} mt={0.5}>
                        <Chip
                          label={member.role}
                          size="small"
                          color={member.role === 'owner' ? 'primary' : 'default'}
                        />
                        {Object.entries(member.dietary).filter(([, value]) => value).map(([key]) => (
                          <Chip
                            key={key}
                            label={key}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  {isOwner && user?.id && user.id !== currentUserId && (
                    <IconButton
                      onClick={() => onRemoveMember(user.id)}
                      color="error"
                      size="small"
                      aria-label={`Remove ${userName} from team`}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              );
            })}
      </CardContent>
    </Card>
  );
}
