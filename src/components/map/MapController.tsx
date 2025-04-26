'use client';

import { useEffect } from 'react';
import type { Map } from 'mapbox-gl';

interface MapControllerProps {
  emergencyVehicle?: { 
    lat: number; 
    lng: number; 
  };
  followEmergency: boolean;
  zoomLevel?: number;
  mapRef: React.RefObject<Map | null>;
}

/**
 * MapController component for controlling the Mapbox map view
 */
export default function MapController({ 
  emergencyVehicle, 
  followEmergency, 
  zoomLevel = 15,
  mapRef
}: MapControllerProps) {

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    try {
      // Only pan to emergency vehicle if we're in follow mode and have vehicle data
      if (followEmergency && emergencyVehicle) {
        console.log('Setting map view to emergency vehicle:', emergencyVehicle);
        map.flyTo({
          center: [emergencyVehicle.lng, emergencyVehicle.lat],
          zoom: zoomLevel,
          essential: true
        });
      }
    } catch (error) {
      console.error('Error setting map view:', error);
    }
  }, [mapRef, followEmergency, emergencyVehicle, zoomLevel]);

  // This component doesn't render anything visible
  return null;
} 