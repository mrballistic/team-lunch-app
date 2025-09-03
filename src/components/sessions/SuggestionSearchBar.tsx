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
        <InputLabel>Type</InputLabel>
        <Select
          value={type}
          label="Type"
          onChange={e => setType(e.target.value as 'restaurant' | 'style')}
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
      />
      <Button type="submit" variant="contained" size="small">
        Suggest
      </Button>
    </Box>
  );
}
