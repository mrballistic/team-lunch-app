import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
  Box,
  Typography
} from '@mui/material';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  loading?: boolean;
}

export default function ReviewDialog({ open, onClose, onSubmit, loading }: ReviewDialogProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!rating) {
      setError('Please provide a rating');
      return;
    }
    setError(null);
    onSubmit(rating, comment);
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="review-dialog-title">
      <DialogTitle id="review-dialog-title">Post-Lunch Review</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography gutterBottom>How was your lunch?</Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
            aria-label="Lunch rating"
          />
        </Box>
        <TextField
          label="Comments (optional)"
          fullWidth
          multiline
          minRows={2}
          value={comment}
          onChange={e => setComment(e.target.value)}
          aria-label="Review comments"
        />
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
