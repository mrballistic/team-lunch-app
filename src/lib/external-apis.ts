// Utility functions for external API calls
import { YELP_API_CONFIG, OPENROUTE_SERVICE_CONFIG, FALLBACK_CONFIG } from './api-config';

export interface YelpBusiness {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  price?: string;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  url: string;
  rating: number;
  review_count: number;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
}

export async function searchYelp(
  term: string,
  latitude: number,
  longitude: number,
  limit = 10,
  price?: string
): Promise<YelpSearchResponse> {
  if (!process.env.YELP_API_KEY) {
    throw new Error('YELP_API_KEY not configured');
  }

  const params = new URLSearchParams({
    term,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    limit: limit.toString(),
    radius: '2000', // 2km radius
    sort_by: 'distance'
  });

  if (price) {
    params.append('price', price);
  }

  const response = await fetch(
    `${YELP_API_CONFIG.baseUrl}${YELP_API_CONFIG.endpoints.search}?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Yelp API error: ${response.status}`);
  }

  return response.json();
}

export async function getWalkingTimes(
  from: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number }>
): Promise<number[]> {
  if (!process.env.OPENROUTE_SERVICE_API_KEY) {
    // Fallback to Haversine calculation
    return destinations.map(dest => calculateHaversineWalkTime(from, dest));
  }

  try {
    const response = await fetch(
      `${OPENROUTE_SERVICE_CONFIG.baseUrl}${OPENROUTE_SERVICE_CONFIG.endpoints.matrix}`,
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.OPENROUTE_SERVICE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: [
            [from.lng, from.lat],
            ...destinations.map(dest => [dest.lng, dest.lat])
          ],
          sources: [0],
          destinations: destinations.map((_, i) => i + 1),
          metrics: ['duration'],
          units: 'm'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data = await response.json();
    return data.durations[0].map((duration: number) => Math.round(duration / 60)); // Convert to minutes
  } catch (error) {
    console.error('OpenRouteService API failed, using fallback:', error);
    return destinations.map(dest => calculateHaversineWalkTime(from, dest));
  }
}

// Haversine formula for distance calculation fallback
function calculateHaversineDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = FALLBACK_CONFIG.earthRadius;
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function calculateHaversineWalkTime(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const distance = calculateHaversineDistance(from, to);
  const walkTimeHours = distance / FALLBACK_CONFIG.avgWalkingSpeed;
  return Math.round(walkTimeHours * 60); // Convert to minutes
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
