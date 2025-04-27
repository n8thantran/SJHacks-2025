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
const sanjose = { lat: 37.3352, lng: -121.8863 };

// Street segments
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

// Emergency vehicle info
const emergencyVehicles = [
  { 
    id: 1, 
    type: "ambulance", 
    heading: 0, 
    speeds: [35, 25, 20, 30, 15, 40, 35],
    route: [
      { lat: 37.335830, lng: -121.886026 },
      { lat: 37.328644, lng: -121.880680 },
      { lat: 37.329611, lng: -121.878500 },
      { lat: 37.332555, lng: -121.880685 },
      { lat: 37.333040, lng: -121.879653 },
      { lat: 37.335053, lng: -121.875453 },
      { lat: 37.339373, lng: -121.878686 },
      { lat: 37.335831, lng: -121.886034 }
    ]
  },
  {
    id: 2,
    type: "ambulance",
    heading: 0,
    speeds: [40, 30, 25, 35, 20, 45, 30, 25, 35, 40, 30, 35, 25, 30, 35, 40, 35, 40, 35, 35],
    route: [
      { lat: 37.326093, lng: -121.885250 },
      { lat: 37.326844, lng: -121.883677 },
      { lat: 37.327419, lng: -121.884041 },
      { lat: 37.328609, lng: -121.884888 },
      { lat: 37.329583, lng: -121.882841 },
      { lat: 37.332467, lng: -121.884973 },
      { lat: 37.337142, lng: -121.888464 },
      { lat: 37.339192, lng: -121.884218 },
      { lat: 37.337336, lng: -121.882830 },
      { lat: 37.339846, lng: -121.877690 },
      { lat: 37.336984, lng: -121.875565 },
      { lat: 37.336012, lng: -121.877537 },
      { lat: 37.324302, lng: -121.868837 },
      { lat: 37.320311, lng: -121.877264 },
      { lat: 37.319350, lng: -121.878787 },
      { lat: 37.319101, lng: -121.881304 },
      { lat: 37.319282, lng: -121.881609 },
      { lat: 37.318934, lng: -121.882226 },
      { lat: 37.325210, lng: -121.886885 },
      { lat: 37.325361, lng: -121.886816 },
      { lat: 37.326093, lng: -121.885250 }
    ]
  }
];

const trafficCameras = [
  { 
    id: 1, 
    lat: 37.340066, 
    lng: -121.882437, 
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
  onCameraSelect?: (camera: { id: number; name: string }) => void;
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
  
  // Vehicle animation state with sessionStorage persistence
  const [vehiclePositions, setVehiclePositions] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPositions = sessionStorage.getItem('vehiclePositions');
      if (savedPositions) {
        try {
          const parsed = JSON.parse(savedPositions);
          if (Array.isArray(parsed) && parsed.length === emergencyVehicles.length) {
            return parsed;
          }
        } catch (e) {
          console.warn('Failed to load vehicle positions:', e);
        }
      }
    }
    return emergencyVehicles.map(vehicle => vehicle.route[0]);
  });

  const [currentRouteIndices, setCurrentRouteIndices] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedIndices = sessionStorage.getItem('currentRouteIndices');
      if (savedIndices) {
        try {
          const parsed = JSON.parse(savedIndices);
          if (Array.isArray(parsed) && parsed.length === emergencyVehicles.length) {
            return parsed;
          }
        } catch (e) {
          console.warn('Failed to load route indices:', e);
        }
      }
    }
    return emergencyVehicles.map(() => 0);
  });

  const animationRef = useRef<number | null>(null);
  const startTimeRefs = useRef<number[]>(emergencyVehicles.map(() => Date.now()));

  // Initialize startTimeRefs from sessionStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStartTimes = sessionStorage.getItem('startTimeRefs');
      if (savedStartTimes) {
        try {
          const parsed = JSON.parse(savedStartTimes);
          if (Array.isArray(parsed) && parsed.length === emergencyVehicles.length) {
            startTimeRefs.current = parsed;
          }
        } catch (e) {
          console.warn('Failed to load start times:', e);
        }
      }
    }
  }, []);

  // Save vehicle states to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('vehiclePositions', JSON.stringify(vehiclePositions));
        sessionStorage.setItem('currentRouteIndices', JSON.stringify(currentRouteIndices));
        sessionStorage.setItem('startTimeRefs', JSON.stringify(startTimeRefs.current));
      } catch (e) {
        console.warn('Failed to save vehicle states:', e);
      }
    }
  }, [vehiclePositions, currentRouteIndices]);

  const selectedCamera = trafficCameras.find(cam => cam.id === selectedCameraId);
  const videoStream = useVideoStream({
    url: selectedCamera?.feedUrl || '',
    refreshRate: 33,
  });

  // Stop video processing when component unmounts
  useEffect(() => {
    return () => {
      // Only try to stop if we're not in offline mode
      if (selectedCameraId) {
        fetch('http://localhost:8000/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(console.error);
      }
    };
  }, [selectedCameraId]);

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
    if (!popupInfo && selectedCameraId) {
      fetch('http://localhost:8000/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(console.error);
    }
  }, [popupInfo, selectedCameraId]);

  // Client-side only operation
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation effect for vehicle movement
  useEffect(() => {
    if (!isClient) return;

    const animate = (timestamp: number) => {
      const currentTime = Date.now();
      
      // Update positions for all vehicles independently
      const newPositions = emergencyVehicles.map((vehicle, index) => {
        const currentSegment = vehicle.route[currentRouteIndices[index]];
        const nextSegment = vehicle.route[(currentRouteIndices[index] + 1) % vehicle.route.length];
        
        // Get the current speed for this segment
        const currentSpeed = vehicle.speeds[currentRouteIndices[index]];
        // Convert speed from mph to meters per second (1 mph ≈ 0.44704 m/s)
        const speedMps = currentSpeed * 0.44704;
        
        // Calculate distance using Haversine formula for more accurate results
        const R = 6371000; // Earth's radius in meters
        const lat1 = currentSegment.lat * Math.PI / 180;
        const lat2 = nextSegment.lat * Math.PI / 180;
        const deltaLat = (nextSegment.lat - currentSegment.lat) * Math.PI / 180;
        const deltaLng = (nextSegment.lng - currentSegment.lng) * Math.PI / 180;
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        const segmentDuration = (distance / speedMps) * 1000; // Convert to milliseconds
        
        const elapsedTime = currentTime - startTimeRefs.current[index];
        const progress = Math.min(Math.max(elapsedTime / segmentDuration, 0), 1); // Ensure progress is between 0 and 1
        
        // Calculate new position using linear interpolation with safeguards
        const newLat = currentSegment.lat + (nextSegment.lat - currentSegment.lat) * progress;
        const newLng = currentSegment.lng + (nextSegment.lng - currentSegment.lng) * progress;
        
        // Ensure coordinates are valid numbers
        if (isNaN(newLat) || isNaN(newLng)) {
          console.warn(`Invalid coordinates calculated for vehicle ${index}:`, { newLat, newLng });
          return currentSegment; // Return current position if calculation failed
        }
        
        return { lat: newLat, lng: newLng };
      });
      
      setVehiclePositions(newPositions);
      
      // Check if any vehicle needs to move to the next segment
      const newRouteIndices = [...currentRouteIndices];
      let needsUpdate = false;
      
      emergencyVehicles.forEach((vehicle, index) => {
        const currentSegment = vehicle.route[currentRouteIndices[index]];
        const nextSegment = vehicle.route[(currentRouteIndices[index] + 1) % vehicle.route.length];
        const currentSpeed = vehicle.speeds[currentRouteIndices[index]];
        const speedMps = currentSpeed * 0.44704;
        
        // Calculate distance using Haversine formula
        const R = 6371000;
        const lat1 = currentSegment.lat * Math.PI / 180;
        const lat2 = nextSegment.lat * Math.PI / 180;
        const deltaLat = (nextSegment.lat - currentSegment.lat) * Math.PI / 180;
        const deltaLng = (nextSegment.lng - currentSegment.lng) * Math.PI / 180;
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        const segmentDuration = (distance / speedMps) * 1000;
        
        if (currentTime - startTimeRefs.current[index] >= segmentDuration) {
          // When reaching the end of the route, smoothly transition to the start
          newRouteIndices[index] = (currentRouteIndices[index] + 1) % (vehicle.route.length - 1);
          startTimeRefs.current[index] = currentTime;
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        setCurrentRouteIndices(newRouteIndices);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, currentRouteIndices]);

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
      // Check if the click event's target is within the map container
      const clickTarget = e.originalEvent.target as HTMLElement;
      const mapContainer = map.getContainer();
      
      // If the click didn't happen on an element inside the map container or 
      // is already being handled elsewhere, exit early
      if (!mapContainer.contains(clickTarget) || clickTarget.closest('.sidebar-button')) {
        return;
      }
      
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

  const handleCameraClick = async (camera: { id: number; name: string; lat: number; lng: number }) => {
    if (onCameraSelect) {
      onCameraSelect({ id: camera.id, name: camera.name });
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
            emergencyVehicle={vehiclePositions[0]} 
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
        {emergencyVehicles.map((vehicle, index) => (
          <Marker
            key={vehicle.id}
            longitude={vehiclePositions[index].lng}
            latitude={vehiclePositions[index].lat}
          >
            <div 
              className="text-red-500 cursor-pointer transition-transform duration-100"
              style={{
                transform: `rotate(${vehicle.heading}deg)`,
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from reaching map
                e.preventDefault(); // Also prevent default behavior
                setPopupInfo({
                  longitude: vehiclePositions[index].lng,
                  latitude: vehiclePositions[index].lat,
                  content: (
                    <div className="text-black">
                      <h3 className="font-bold">Emergency Vehicle {vehicle.id}</h3>
                      <p>Type: {vehicle.type}</p>
                      <p>Speed: {vehicle.speeds[currentRouteIndices[index]]} mph</p>
                      <p>Current Segment: {currentRouteIndices[index] + 1}/{vehicle.route.length}</p>
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
                e.preventDefault(); // Also prevent default behavior
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