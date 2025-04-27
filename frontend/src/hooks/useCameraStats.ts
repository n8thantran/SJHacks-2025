import { useState, useEffect } from 'react';

interface CameraStats {
  timestamp: string;
  counts: {
    northbound: number;
    southbound: number;
    total: number;
  };
}

export function useCameraStats() {
  const [stats, setStats] = useState<CameraStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/traffic-data');
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching traffic data:', err);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up polling every 1 second
    const interval = setInterval(fetchStats, 1000);

    return () => clearInterval(interval);
  }, []);

  return { stats, error };
} 