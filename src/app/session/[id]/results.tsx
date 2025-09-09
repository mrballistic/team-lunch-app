import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Paper, Chip, Button, CircularProgress, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

interface Suggestion {
  id: string;
  label: string;
  type: 'restaurant' | 'style';
  dietaryFit?: boolean;
  votes?: number;
  distanceMin?: number;
  priceTier?: number;
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranked, setRanked] = useState<Suggestion[]>([]);
  const [winner, setWinner] = useState<Suggestion | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'votes' | 'distance' | 'price' | 'dietary'>('default');
  const [luckyWinner, setLuckyWinner] = useState<Suggestion | null>(null);
  const [luckyCount, setLuckyCount] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sessions/${params.id}/results`, {
          headers: { 'Authorization': 'Bearer temp-token' }
        });
        if (!response.ok) throw new Error('Failed to load results');
        const data = await response.json();
        setRanked(data.ranked || []);
        setWinner(data.winner || null);
      } catch {
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [params.id]);

  const sorted = (() => {
    if (sortBy === 'default') return ranked;
    if (sortBy === 'votes') return [...ranked].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    if (sortBy === 'distance') return [...ranked].sort((a, b) => (a.distanceMin ?? Infinity) - (b.distanceMin ?? Infinity));
    if (sortBy === 'price') return [...ranked].sort((a, b) => (a.priceTier ?? Infinity) - (b.priceTier ?? Infinity));
    if (sortBy === 'dietary') return [...ranked].sort((a, b) => (b.dietaryFit === true ? 1 : 0) - (a.dietaryFit === true ? 1 : 0));
    return ranked;
  })();

  const handleLuckyPick = () => {
    const topN = sorted.slice(0, Math.max(1, luckyCount));
    if (topN.length === 0) return;
    const pick = topN[Math.floor(Math.random() * topN.length)];
    setLuckyWinner(pick);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>Results</Typography>
      {winner && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, background: '#e8f5e9' }}>
          <Typography variant="h5">Winner: {winner.label}</Typography>
          <Box mt={1} display="flex" gap={1}>
            <Chip label={winner.type} color={winner.type === 'restaurant' ? 'primary' : 'default'} />
            {winner.dietaryFit === false && <Chip label="Doesn't fit dietary" color="error" />}
            {winner.dietaryFit === true && <Chip label="Dietary fit" color="success" />}
            {winner.votes !== undefined && <Chip label={`Votes: ${winner.votes}`} />}
            {winner.distanceMin !== undefined && <Chip label={`${winner.distanceMin} min walk`} />}
            {winner.priceTier !== undefined && <Chip label={`$`.repeat(winner.priceTier)} />}
          </Box>
        </Paper>
      )}

      {/* Sort Controls */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <FormControl size="small">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            label="Sort By"
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="votes">Votes</MenuItem>
            <MenuItem value="distance">Distance</MenuItem>
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="dietary">Dietary Fit</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Lucky Picker */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Typography>Lucky Picker (random from top</Typography>
        <Select
          size="small"
          value={luckyCount}
          onChange={e => setLuckyCount(Number(e.target.value))}
          sx={{ width: 60 }}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </Select>
        <Typography>)</Typography>
        <Button variant="outlined" onClick={handleLuckyPick}>Pick!</Button>
        {luckyWinner && (
          <Chip label={`🎲 ${luckyWinner.label}`} color="secondary" sx={{ ml: 2 }} />
        )}
      </Box>

      <Typography variant="h6" mb={2}>Full Ranking</Typography>
      <Box>
        {sorted.map((s, i) => (
          <Paper key={s.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 32 }}>{i + 1}.</Typography>
            <Typography variant="body1" sx={{ flex: 1 }}>{s.label}</Typography>
            <Chip label={s.type} size="small" color={s.type === 'restaurant' ? 'primary' : 'default'} />
            {s.dietaryFit === false && <Chip label="Doesn't fit dietary" color="error" size="small" />}
            {s.dietaryFit === true && <Chip label="Dietary fit" color="success" size="small" />}
            {s.votes !== undefined && <Chip label={`Votes: ${s.votes}`} size="small" />}
            {s.distanceMin !== undefined && <Chip label={`${s.distanceMin} min walk`} size="small" />}
            {s.priceTier !== undefined && <Chip label={`$`.repeat(s.priceTier)} size="small" />}
          </Paper>
        ))}
      </Box>
      <Button variant="contained" sx={{ mt: 4 }} onClick={() => router.push(`/session/${params.id}`)}>
        Back to Session
      </Button>
    </Container>
  );
}
