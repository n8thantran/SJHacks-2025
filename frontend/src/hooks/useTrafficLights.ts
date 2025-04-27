import { useState, useEffect } from 'react';

export type LightColor = 'red' | 'yellow' | 'green' | 'unknown';

// Interface to hold status for all directions
interface TrafficLightStatus {
  timestamp: string;
  lights: {
    north: LightColor;
    south: LightColor; // Keep south, even if unused for now
    east: LightColor;
    west: LightColor;
  };
}

// Fallback data
const fallbackLights: TrafficLightStatus = {
  timestamp: new Date().toISOString(),
  lights: {
    north: 'unknown',
    south: 'unknown',
    east: 'unknown',
    west: 'unknown'
  }
};

const endpoints = {
  north: 'http://localhost:5052/north',
  west: 'http://localhost:5052/west',
  east: 'http://localhost:5052/east'
};

export function useTrafficLights(refreshInterval: number = 2000) {
  const [status, setStatus] = useState<TrafficLightStatus>(fallbackLights);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const results: Partial<Record<keyof typeof endpoints, LightColor>> = {};
      let fetchErrors: string[] = [];

      // Fetch all endpoints concurrently
      await Promise.allSettled(
        Object.entries(endpoints).map(async ([direction, url]) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Status ${response.status}`);
            }
            const data: { color: LightColor } = await response.json();
            if (data && data.color) {
              results[direction as keyof typeof endpoints] = data.color;
            } else {
              throw new Error('Invalid response format');
            }
          } catch (err) {
            fetchErrors.push(`${direction}: ${err instanceof Error ? err.message : 'Fetch failed'}`);
            results[direction as keyof typeof endpoints] = 'unknown'; // Set to unknown on error
          }
        })
      );

      // Update state
      setStatus({
        timestamp: new Date().toISOString(),
        lights: {
          north: results.north ?? 'unknown',
          south: 'unknown', // South remains unknown
          east: results.east ?? 'unknown',
          west: results.west ?? 'unknown',
        }
      });

      // Update error state
      if (fetchErrors.length > 0) {
        setError(`Errors fetching light data: ${fetchErrors.join('; ')}`);
      } else {
        setError(null); // Clear error if all succeed
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling
    const interval = setInterval(fetchStatus, refreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);

  }, [refreshInterval]);

  return { status, error };
} 