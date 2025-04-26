'use client';

import { ReactNode, useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// This component ensures Mapbox is properly initialized and CSS is loaded
export default function MapboxContainer({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Mapbox when component mounts
    const init = async () => {
      try {
        // Mapbox GL JS is automatically initialized when imported
        // No need for explicit initialization like with Leaflet
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Mapbox:', err);
        setError('Failed to initialize map. Please refresh the page.');
      }
    };
    
    init();
    
    // No cleanup needed as CSS is imported directly
  }, []);
  
  if (error) {
    return (
      <div className="w-full h-full bg-slate-800 rounded-lg flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-2">Error: {error}</div>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
        Initializing map...
      </div>
    );
  }
  
  return children;
} 