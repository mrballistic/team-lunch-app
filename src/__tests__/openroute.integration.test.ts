import { getWalkingTimes } from '../lib/external-apis';

describe('OpenRouteService integration', () => {
  it('should return walking times for valid coordinates', async () => {
    const from = { lat: 40.748817, lng: -73.985428 }; // Empire State Building
    const destinations = [
      { lat: 40.752726, lng: -73.977229 }, // Grand Central Terminal
      { lat: 40.758896, lng: -73.985130 }  // Times Square
    ];
    const times = await getWalkingTimes(from, destinations);
    expect(times.length).toBe(destinations.length);
    times.forEach(time => expect(typeof time).toBe('number'));
  });
});
