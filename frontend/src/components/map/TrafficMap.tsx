'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Map, { Marker, Popup, Layer, Source } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';
import { Ambulance } from 'lucide-react';
import { getStatusColor } from '@/lib/mapbox-globals';
import MapboxContainer from './MapboxContainer';
import MapController from './MapController';
import type { Map as MapboxMap } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';

// Set access token for Mapbox
if (process.env.MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
}

// San Jose Center coordinates
const sanjose = { lat: 37.3382, lng: -121.8863 };

// Mock intersections data
const intersections = [
  { id: 1, name: "1st & Santa Clara", lat: 37.3367, lng: -121.8888, status: "normal", congestion: 0.4 },
  { id: 2, name: "Market & San Carlos", lat: 37.3299, lng: -121.8876, status: "congested", congestion: 0.8 },
  { id: 3, name: "4th & San Fernando", lat: 37.3368, lng: -121.8851, status: "emergency", congestion: 0.5 },
  { id: 4, name: "10th & Santa Clara", lat: 37.3397, lng: -121.8767, status: "normal", congestion: 0.3 },
  { id: 5, name: "Monterey & Curtner", lat: 37.2909, lng: -121.8539, status: "normal", congestion: 0.2 },
];

// Mock emergency vehicle data
const emergencyVehicles = [
  { id: 1, lat: 37.3350, lng: -121.8860, type: "ambulance", heading: 45, speed: 45 },
];

interface TrafficMapProps {
  followEmergency?: boolean;
}

export default function TrafficMap({ followEmergency = false }: TrafficMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<MapboxMap | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    content: React.ReactNode;
  } | null>(null);

  // Create circle layers for intersections
  const circleLayersData = {
    type: 'FeatureCollection',
    features: intersections.map(intersection => ({
      type: 'Feature',
      properties: {
        id: intersection.id,
        name: intersection.name,
        status: intersection.status,
        congestion: intersection.congestion,
        color: getStatusColor(intersection.status),
      },
      geometry: {
        type: 'Point',
        coordinates: [intersection.lng, intersection.lat],
      },
    })),
  };

  // Client-side only operation
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the native Mapbox instance
  const onMapLoad = useCallback((evt: { target: MapboxMap }) => {
    mapRef.current = evt.target;
  }, []);

  if (!isClient) {
    return null;
  }

  // Create circle layers for intersections
  const circleLayer: LayerProps = {
    id: 'intersection-circles',
    type: 'circle',
    paint: {
      'circle-radius': 40,
      'circle-color': ['get', 'color'],
      'circle-opacity': ['get', 'congestion'],
      'circle-stroke-width': 2,
      'circle-stroke-color': ['get', 'color'],
    },
  };

  return (
    <MapboxContainer>
      <Map
        mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: sanjose.lng,
          latitude: sanjose.lat,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={onMapLoad}
      >
        {/* Map controller for following emergency vehicles */}
        {followEmergency && emergencyVehicles.length > 0 && (
          <MapController 
            emergencyVehicle={emergencyVehicles[0]} 
            followEmergency={followEmergency}
            mapRef={mapRef}
          />
        )}

        {/* Render intersections as a data layer */}
        <Source id="intersections" type="geojson" data={circleLayersData as GeoJSON.FeatureCollection}>
          <Layer {...circleLayer} />
        </Source>

        {/* Render emergency vehicles as markers */}
        {emergencyVehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            longitude={vehicle.lng}
            latitude={vehicle.lat}
          >
            <div 
              className="text-red-500 cursor-pointer"
              onClick={() => {
                setPopupInfo({
                  longitude: vehicle.lng,
                  latitude: vehicle.lat,
                  content: (
                    <div>
                      <h3 className="font-bold">Emergency Vehicle</h3>
                      <p>Type: {vehicle.type}</p>
                      <p>Speed: {vehicle.speed} mph</p>
                    </div>
                  )
                });
              }}
            >
              <Ambulance size={24} fill="currentColor" />
            </div>
          </Marker>
        ))}

        {/* Popup for markers */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
          >
            {popupInfo.content}
          </Popup>
        )}
      </Map>
    </MapboxContainer>
  );
} 