import { useState, useEffect } from 'react';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Typography, Alert, CircularProgress } from '@mui/material';

const DIETARY_OPTIONS = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten_free', label: 'Gluten-Free' },
  { key: 'dairy_free', label: 'Dairy-Free' },
  { key: 'nut_free', label: 'Nut-Free' },
  { key: 'halal', label: 'Halal' },
  { key: 'kosher', label: 'Kosher' },
];

export default function DietarySettings({ teamId, accessToken, onUpdated }: { teamId: string, accessToken: string, onUpdated?: () => void }) {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teams/${teamId}/dietary`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error('Failed to load dietary settings');
        const data = await res.json();
        setSettings(data || {});
      } catch {
        setError('Failed to load dietary settings.');
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId, accessToken]);

  const handleChange = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/teams/${teamId}/dietary`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ dietary: settings })
      });
      if (!res.ok) throw new Error('Failed to update dietary settings');
      setSuccess(true);
      if (onUpdated) onUpdated();
    } catch {
      setError('Failed to update dietary settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box mb={3}>
      <Typography variant="h6" mb={1}>Your Dietary Preferences</Typography>
      <FormGroup row>
        {DIETARY_OPTIONS.map(opt => (
          <FormControlLabel
            key={opt.key}
            control={
              <Checkbox
                checked={!!settings[opt.key]}
                onChange={() => handleChange(opt.key)}
                name={opt.key}
                color="primary"
                inputProps={{ 'aria-label': opt.label }}
              />
            }
            label={opt.label}
          />
        ))}
      </FormGroup>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>Dietary settings updated!</Alert>}
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave} disabled={saving}>
        Save Preferences
      </Button>
    </Box>
  );
}
