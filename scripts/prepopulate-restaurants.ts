// scripts/prepopulate-restaurants.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSupabaseAdminClient } from '../src/lib/supabase';
import { searchYelp } from '../src/lib/external-apis';

// Set these for your team

const TEAM_ID = process.env.TEAM_ID || 'YOUR_TEAM_ID_HERE';
const TEAM_LAT = process.env.TEAM_LAT ? parseFloat(process.env.TEAM_LAT) : 45.52761; // Replace with your team's lat
const TEAM_LON = process.env.TEAM_LON ? parseFloat(process.env.TEAM_LON) : -122.71472; // Replace with your team's lon

if (!TEAM_ID || TEAM_ID === 'YOUR_TEAM_ID_HERE') {
  console.error('Please set TEAM_ID, TEAM_LAT, and TEAM_LON at the top of the script or via environment variables.');
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