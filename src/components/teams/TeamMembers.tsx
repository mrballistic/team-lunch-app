import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  Box,
  Button,
  IconButton
} from '@mui/material';
import { PersonAdd, Delete } from '@mui/icons-material';

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
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
}

export default function TeamMembers({
  members,
  currentUserId,
  isOwner,
  onAddMember,
  onRemoveMember
}: TeamMembersProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Team Members ({members.length})
          </Typography>
          {isOwner && (
            <Button
              startIcon={<PersonAdd />}
              variant="outlined"
              onClick={onAddMember}
              size="small"
            >
              Add Member
            </Button>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {members.map((member) => (
            <Box
              key={member.user.id}
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
                  src={member.user.avatar_url || undefined}
                  alt={member.user.name || member.user.email}
                >
                  {(member.user.name || member.user.email)[0].toUpperCase()}
                </Avatar>
                
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {member.user.name || member.user.email}
                  </Typography>
                  {member.user.name && (
                    <Typography variant="body2" color="text.secondary">
                      {member.user.email}
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

              {isOwner && member.user.id !== currentUserId && (
                <IconButton
                  onClick={() => onRemoveMember(member.user.id)}
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
