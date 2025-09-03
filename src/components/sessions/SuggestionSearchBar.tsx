import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

interface SuggestionSearchBarProps {
  onSuggest: (type: 'restaurant' | 'style', label: string) => void;
}

export default function SuggestionSearchBar({ onSuggest }: SuggestionSearchBarProps) {
  const [type, setType] = useState<'restaurant' | 'style'>('restaurant');
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onSuggest(type, label.trim());
      setLabel('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" gap={2} alignItems="center" mb={2}>
      <FormControl size="small">
        <InputLabel id="type-label">Type</InputLabel>
        <Select
          labelId="type-label"
          value={type}
          label="Type"
          onChange={e => setType(e.target.value as 'restaurant' | 'style')}
          inputProps={{ 'aria-label': 'Suggestion type' }}
        >
          <MenuItem value="restaurant">Restaurant</MenuItem>
          <MenuItem value="style">Cuisine/Style</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={type === 'restaurant' ? 'Restaurant Name' : 'Cuisine/Style'}
        value={label}
        onChange={e => setLabel(e.target.value)}
        size="small"
        variant="outlined"
        sx={{ minWidth: 200 }}
        inputProps={{ 'aria-label': type === 'restaurant' ? 'Restaurant name' : 'Cuisine or style' }}
      />
      <Button type="submit" variant="contained" size="small" aria-label="Suggest restaurant or style">
        Suggest
      </Button>
    </Box>
  );
}
