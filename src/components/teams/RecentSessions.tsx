import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import { PlayArrow, Visibility, CheckCircle } from '@mui/icons-material';

interface RecentSession {
  id: string;
  status: 'draft' | 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
}

interface RecentSessionsProps {
  sessions: RecentSession[];
  onViewSession: (sessionId: string) => void;
}

export default function RecentSessions({
  sessions,
  onViewSession
}: RecentSessionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'open': return 'warning';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <PlayArrow />;
      case 'open': return <PlayArrow />;
      case 'closed': return <CheckCircle />;
      default: return <Visibility />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Recent Sessions
        </Typography>

        {sessions.length === 0 ? (
          <Typography color="text.secondary" aria-live="polite">
            No sessions yet. Create your first lunch session!
          </Typography>
        ) : (
          <List disablePadding role="list">
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                disablePadding
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  p: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        Session {session.id.slice(0, 8)}
                      </Typography>
                      <Chip
                        label={session.status}
                        size="small"
                        color={getStatusColor(session.status) as 'default' | 'warning' | 'success'}
                        icon={getStatusIcon(session.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Created: {formatDate(session.created_at)}
                      </Typography>
                      {session.closed_at && (
                        <Typography variant="body2" color="text.secondary">
                          Closed: {formatDate(session.closed_at)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <IconButton
                  onClick={() => onViewSession(session.id)}
                  size="small"
                  aria-label={`View session ${session.id.slice(0, 8)}`}
                >
                  <Visibility />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
