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

// Downtown San Jose center coordinates
const sanjose = { lat: 37.3352, lng: -121.8863 };

// Street segments for perfect cross shape
const streetSegments = [
  {
    id: 1,
    name: "South-4th Street",
    status: "congested",
    congestion: 0.8,
    coordinates: [
      [-121.886053, 37.335816], // West end
      [-121.882917, 37.331601]  // East end
    ]
  },
  {
    id: 2,
    name: "San Fernando Street",
    status: "emergency",
    congestion: 0.5,
    coordinates: [
      [-121.879953, 37.338838], // North end
      [-121.886015, 37.335857]  // South end
    ]
  },
  {
    id: 3,
    name: "North-South Street 2",
    status: "normal",
    congestion: 0.4,
    coordinates: [
      [-121.888107, 37.334828], // North end
      [-121.886103, 37.332135]  // South end
    ]
  }
];

// Mock emergency vehicle data
const emergencyVehicles = [
  { id: 1, lat: 37.3350, lng: -121.8860, type: "ambulance", heading: 45, speed: 45 },
];

// Create street segments layer data
const streetLayersData = {
  type: 'FeatureCollection',
  features: streetSegments.map(segment => ({
    type: 'Feature',
    properties: {
      id: segment.id,
      name: segment.name,
      status: segment.status,
      congestion: segment.congestion,
      color: getStatusColor(segment.status),
    },
    geometry: {
      type: 'LineString',
      coordinates: segment.coordinates
    },
  })),
} as GeoJSON.FeatureCollection;

// Create street line layer style
const streetLayerStyle: LayerProps = {
  id: 'street-lines',
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 3,
    'line-opacity': 1
  },
};

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
  const [hoveredStreetId, setHoveredStreetId] = useState<number | null>(null);

  // Client-side only operation
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the native Mapbox instance
  const onMapLoad = useCallback((evt: { target: MapboxMap }) => {
    mapRef.current = evt.target;
    
    // Add hover interactivity for streets
    const map = evt.target;
    
    // Add event for when mouse enters a street
    map.on('mouseenter', 'street-lines', (e) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];
        setHoveredStreetId(feature.properties?.id);
      }
    });
    
    // Remove hover when mouse leaves
    map.on('mouseleave', 'street-lines', () => {
      map.getCanvas().style.cursor = '';
      setHoveredStreetId(null);
    });
    
    // Click on street to show popup
    map.on('click', 'street-lines', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const coordinates = e.lngLat;
        
        // Get the midpoint of the line for popup placement
        setPopupInfo({
          longitude: coordinates.lng,
          latitude: coordinates.lat,
          content: (
            <div className="text-black">
              <h3 className="font-bold">{feature.properties?.name}</h3>
              <p>Status: {feature.properties?.status}</p>
              <p>Congestion: {(feature.properties?.congestion * 100).toFixed(0)}%</p>
            </div>
          )
        });
      }
    });
  }, []);

  if (!isClient) {
    return null;
  }

  // Create street hover layer style
  const streetHoverLayerStyle: LayerProps = {
    id: 'street-lines-hover',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 6,
      'line-opacity': 1
    },
    filter: ['==', 'id', hoveredStreetId || '']
  };

  return (
    <MapboxContainer>
      <Map
        mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: -121.8863,
          latitude: 37.3352,
          zoom: 15.5,
          pitch: 0,
          bearing: 0
        }}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={onMapLoad}
        interactiveLayerIds={['street-lines']}
      >
        {/* Map controller for following emergency vehicles */}
        {followEmergency && emergencyVehicles.length > 0 && (
          <MapController 
            emergencyVehicle={emergencyVehicles[0]} 
            followEmergency={followEmergency}
            mapRef={mapRef}
          />
        )}

        {/* Render street segments as a line layer */}
        <Source id="streets-source" type="geojson" data={streetLayersData}>
          <Layer {...streetLayerStyle} />
          <Layer {...streetHoverLayerStyle} />
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
                    <div className="text-black">
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

        {/* Popup for markers and streets */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
          >
            {popupInfo.content}
          </Popup>
        )}
      </Map>
    </MapboxContainer>
  );
} 