import { useState, useEffect } from 'react';

interface CameraStats {
  timestamp: string;
  counts: {
    northbound: number;
    southbound: number;
    total: number;
  };
}

// Fallback data when backend is not available
const fallbackStats: CameraStats = {
  timestamp: new Date().toISOString(),
  counts: {
    northbound: 45,
    southbound: 38,
    total: 83
  }
};

export function useCameraStats() {
  const [stats, setStats] = useState<CameraStats | null>(fallbackStats);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/traffic-data');
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const data = await response.json();
        setStats(data);
        setIsOffline(false);
      } catch (err) {
        console.error('Error fetching traffic data:', err);
        setStats(fallbackStats);
        setIsOffline(true);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up polling every 1 second
    const interval = setInterval(fetchStats, 1000);

    return () => clearInterval(interval);
  }, []);

  return { stats, error, isOffline };
} 