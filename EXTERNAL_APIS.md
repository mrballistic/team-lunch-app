# External API Setup Instructions

## Yelp Fusion API
1. Go to [Yelp Developers](https://www.yelp.com/developers)
2. Create a new app to get your API key
3. Add the API key to your environment variables as `YELP_API_KEY`

**Features Used:**
- Business Search API for finding restaurants by cuisine/location
- Business Details API for additional restaurant information
- Rate limit: 5,000 requests/day

## OpenRouteService API  
1. Go to [OpenRouteService](https://openrouteservice.org/dev/#/signup)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add the API key to your environment variables as `OPENROUTE_SERVICE_API_KEY`

**Features Used:**
- Matrix API for calculating walking times between locations
- Foot-walking profile for accurate pedestrian routes
- Rate limit: 2,000 requests/day (free tier)

## Fallback Strategy
If external APIs fail or reach rate limits, the app will:
- Use Haversine formula for distance calculations
- Estimate walking times based on average walking speed (5 km/h)
- Cache results to minimize API calls

## Environment Variables to Add:
```
YELP_API_KEY=your_yelp_api_key_here
OPENROUTE_SERVICE_API_KEY=your_openroute_service_api_key_here
```

## Testing APIs
You can test the API integrations by creating a test restaurant search and distance calculation.
