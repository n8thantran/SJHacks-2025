'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Map, { Marker, Popup, Layer, Source } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';
import { Ambulance, Camera, Pause, Play } from 'lucide-react';
import { getStatusColor } from '@/lib/mapbox-globals';
import MapboxContainer from './MapboxContainer';
import MapController from './MapController';
import type { Map as MapboxMap } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import { useVideoStream } from '@/hooks/useVideoStream';

// Set access token for Mapbox
if (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
}

// Downtown San Jose center coordinates
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Mock traffic camera data
const trafficCameras = [
  { 
    id: 1, 
    lat: 37.3355, 
    lng: -121.8865, 
    name: "Main Intersection Camera",
    feedUrl: "http://localhost:8000/video-feed" // Updated to use our FastAPI endpoint
  }
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
  onCameraSelect?: (camera: { name: string; feedUrl: string }) => void;
}

export default function TrafficMap({ followEmergency = false, onCameraSelect }: TrafficMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<MapboxMap | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    content: React.ReactNode;
  } | null>(null);
  const [hoveredStreetId, setHoveredStreetId] = useState<number | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  
  const selectedCamera = trafficCameras.find(cam => cam.id === selectedCameraId);
  const videoStream = useVideoStream({
    url: selectedCamera?.feedUrl || '',
    refreshRate: 33,
  });

  // Stop video processing when component unmounts
  useEffect(() => {
    return () => {
      // Stop video processing on unmount
      fetch('http://localhost:8000/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(console.error);
    };
  }, []);

  // Stop video processing when camera is deselected
  useEffect(() => {
    if (!selectedCameraId) {
      fetch('http://localhost:8000/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(console.error);
    }
  }, [selectedCameraId]);

  // Stop video processing when popup is closed
  useEffect(() => {
    if (!popupInfo) {
      fetch('http://localhost:8000/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(console.error);
    }
  }, [popupInfo]);

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
    
    // Handle map click to deselect camera
    map.on('click', (e) => {
      // Check if the camera-markers layer exists
      const cameraLayer = map.getStyle().layers?.find(layer => layer.id === 'camera-markers');
      
      if (cameraLayer) {
        // Check if the click was on a camera marker
        const features = map.queryRenderedFeatures(e.point, { 
          layers: ['camera-markers'] 
        });
        
        // If click was not on a camera marker, deselect the camera
        if (features.length === 0) {
          setSelectedCameraId(null);
          setPopupInfo(null);
        }
      } else {
        // If camera layer doesn't exist, just deselect
        setSelectedCameraId(null);
        setPopupInfo(null);
      }
    });
  }, []);

  const handleCameraClick = async (camera: { id: number; name: string; feedUrl: string; lat: number; lng: number }) => {
    try {
      // Send POST request to start video processing
      const response = await fetch('http://localhost:8000/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start video processing');
      }

      // Call the original onCameraSelect if provided
      if (onCameraSelect) {
        onCameraSelect({
          name: camera.name,
          feedUrl: camera.feedUrl
        });
      }
      setSelectedCameraId(camera.id);
    } catch (error) {
      console.error('Error starting video processing:', error);
      // Show error state
      setSelectedCameraId(null);
      setPopupInfo({
        longitude: camera.lng,
        latitude: camera.lat,
        content: (
          <div className="text-black">
            <h3 className="font-bold text-red-500">Camera Offline</h3>
            <p>Unable to connect to camera feed</p>
          </div>
        )
      });
    }
  };

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
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
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
        interactiveLayerIds={['street-lines', 'camera-markers']}
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

        {/* Render traffic cameras as markers */}
        {trafficCameras.map((camera) => (
          <Marker
            key={camera.id}
            longitude={camera.lng}
            latitude={camera.lat}
            offset={[-50, 15]}
          >
            <div 
              className={`cursor-pointer relative ${
                selectedCameraId === camera.id ? 'text-green-500' : 'text-blue-500'
              }`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from reaching map
                handleCameraClick(camera);
              }}
            >
              <div className="relative">
                <div className={`absolute -top-1 -left-1 w-8 h-8 ${
                  selectedCameraId === camera.id ? 'bg-green-500/20' : 'bg-blue-500/20'
                } rounded-full`}></div>
                <Camera size={24} className="relative" />
              </div>
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
            closeButton={true}
          >
            {popupInfo.content}
          </Popup>
        )}
      </Map>
    </MapboxContainer>
  );
} 