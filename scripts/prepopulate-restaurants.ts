// scripts/prepopulate-restaurants.ts

import dotenv from 'dotenv';
// Load .env.local then .env as a fallback
dotenv.config({ path: '.env.local' });
dotenv.config();
import { getSupabaseAdminClient } from '../src/lib/supabase';
import { searchYelp } from '../src/lib/external-apis';

// Set these for your team

const TEAM_ID = process.env.TEAM_ID || process.env.NEXT_PUBLIC_TEAM_ID || '';
const TEAM_LAT = process.env.TEAM_LAT ? parseFloat(process.env.TEAM_LAT) : 45.52761;
const TEAM_LON = process.env.TEAM_LON ? parseFloat(process.env.TEAM_LON) : -122.71472;

if (!TEAM_ID) {
  console.error('Please set TEAM_ID (or NEXT_PUBLIC_TEAM_ID) in .env.local before running this script.');
  process.exit(1);
}

async function main() {
  const supabase = getSupabaseAdminClient();


  // Yelp API types
  type YelpCategory = { alias: string; title: string };
  type YelpBusiness = {
    id: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
    price?: string;
    categories: YelpCategory[];
  };

  let yelpResults: { businesses: YelpBusiness[] };
  try {
    yelpResults = await searchYelp(
      'restaurants',
      TEAM_LAT,
      TEAM_LON,
      20 // limit
    );
  } catch (err) {
    console.error('Error calling Yelp API:', err);
    process.exit(1);
  }

  if (!yelpResults || !yelpResults.businesses || yelpResults.businesses.length === 0) {
    console.error('No businesses found from Yelp.');
    return;
  }

  // Map Yelp data to your schema
  const inserts = yelpResults.businesses.map((biz: YelpBusiness) => ({
    team_id: TEAM_ID,
    name: biz.name,
    yelp_id: biz.id,
    lat: biz.coordinates.latitude,
    lng: biz.coordinates.longitude,
    price_tier: biz.price ? biz.price.length : null,
    tags: biz.categories.map((c: YelpCategory) => c.title),
    supports_dietary: {}, // Optionally parse from Yelp attributes
  }));

  // Insert into Supabase
  const { error } = await supabase
    .from('restaurants')
    .insert(inserts);

  if (error) {
    console.error('Error inserting restaurants:', error);
  } else {
    console.log(`Inserted ${inserts.length} restaurants for team ${TEAM_ID}`);
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});