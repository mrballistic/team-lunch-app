// External API configurations
export const YELP_API_CONFIG = {
  baseUrl: 'https://api.yelp.com/v3',
  endpoints: {
    search: '/businesses/search',
    details: '/businesses'
  }
};

export const OPENROUTE_SERVICE_CONFIG = {
  baseUrl: 'https://api.openrouteservice.org/v2',
  endpoints: {
    matrix: '/matrix/foot-walking'
  }
};

// API rate limits and caching
export const API_LIMITS = {
  yelp: {
    requestsPerDay: 5000,
    cacheExpiry: 3600000 // 1 hour in ms
  },
  openroute: {
    requestsPerDay: 2000,
    cacheExpiry: 3600000 // 1 hour in ms
  }
};

// Fallback calculations
export const FALLBACK_CONFIG = {
  // Haversine formula constants
  earthRadius: 6371, // km
  avgWalkingSpeed: 5, // km/h
  
  // Default responses when APIs fail
  defaultWalkTime: 15, // minutes
  defaultDistance: 1.2 // km
};
