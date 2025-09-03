import { getWalkingTimeFromORS, getWalkingTimeFromYelp } from './external-apis';

export async function getDistanceProxy(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number | null> {
  // Try OpenRouteService first
  try {
    const orsTime = await getWalkingTimeFromORS(origin, destination);
    if (typeof orsTime === 'number') return orsTime;
  } catch {}
  // Fallback to Yelp (if available)
  try {
    const yelpTime = await getWalkingTimeFromYelp(origin, destination);
    if (typeof yelpTime === 'number') return yelpTime;
  } catch {}
  // If all fail, return null
  return null;
}
