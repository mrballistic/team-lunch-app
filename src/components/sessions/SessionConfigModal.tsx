import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface SessionConfigModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (config: {
    maxWalkMinutes: number;
    priceMin: number;
    priceMax: number;
    cooldownDays: number;
  }) => void;
}

export default function SessionConfigModal({ open, onClose, onCreate }: SessionConfigModalProps) {
  const [maxWalkMinutes, setMaxWalkMinutes] = useState(10);
  const [priceMin, setPriceMin] = useState(1);
  const [priceMax, setPriceMax] = useState(3);
  const [cooldownDays, setCooldownDays] = useState(7);

  const handleCreate = () => {
    onCreate({ maxWalkMinutes, priceMin, priceMax, cooldownDays });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configure Lunch Session</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Max Walk Minutes"
            type="number"
            value={maxWalkMinutes}
            onChange={e => setMaxWalkMinutes(Number(e.target.value))}
            inputProps={{ min: 1, max: 60, 'aria-label': 'Max walk minutes' }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="min-price-label">Min Price Tier</InputLabel>
            <Select
              labelId="min-price-label"
              value={priceMin}
              label="Min Price Tier"
              onChange={e => setPriceMin(Number(e.target.value))}
              inputProps={{ 'aria-label': 'Min price tier' }}
            >
              <MenuItem value={1}>$</MenuItem>
              <MenuItem value={2}>$$</MenuItem>
              <MenuItem value={3}>$$$</MenuItem>
              <MenuItem value={4}>$$$$</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="max-price-label">Max Price Tier</InputLabel>
            <Select
              labelId="max-price-label"
              value={priceMax}
              label="Max Price Tier"
              onChange={e => setPriceMax(Number(e.target.value))}
              inputProps={{ 'aria-label': 'Max price tier' }}
            >
              <MenuItem value={1}>$</MenuItem>
              <MenuItem value={2}>$$</MenuItem>
              <MenuItem value={3}>$$$</MenuItem>
              <MenuItem value={4}>$$$$</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Cooldown Days"
            type="number"
            value={cooldownDays}
            onChange={e => setCooldownDays(Number(e.target.value))}
            inputProps={{ min: 0, max: 30, 'aria-label': 'Cooldown days' }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} aria-label="Cancel session configuration">Cancel</Button>
        <Button onClick={handleCreate} variant="contained" aria-label="Create session">Create Session</Button>
      </DialogActions>
    </Dialog>
  );
}
