import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface HistorySession {
  id: string;
  date: string;
  restaurant: string;
  rating: number | null;
  review: string | null;
}

interface TeamHistoryProps {
  history: HistorySession[];
}

export default function TeamHistory({ history }: TeamHistoryProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Lunch History
        </Typography>
        {history.length === 0 ? (
          <Typography color="text.secondary" aria-live="polite">
            No lunch history yet.
          </Typography>
        ) : (
          <List disablePadding role="list">
            {history.map((session) => (
              <ListItem key={session.id} disablePadding sx={{ mb: 1, p: 1 }}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {session.restaurant}
                      </Typography>
                      {session.rating !== null && (
                        <Chip label={`Rating: ${session.rating}`} size="small" color="success" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      {session.review && (
                        <Typography variant="body2" color="text.secondary">
                          &quot;{session.review}&quot;
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
