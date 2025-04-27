'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AlertPanel from '@/components/alerts/AlertPanel';
import { MapPin, Car, Clock, AlertCircle, Camera, Lightbulb } from 'lucide-react';
import { useCameraStats } from '@/hooks/useCameraStats';
import CameraViewer from '@/components/cameras/CameraViewer';
import { useTrafficLights } from '@/hooks/useTrafficLights';
import type { LightColor } from '@/hooks/useTrafficLights';

// Import TrafficMap component dynamically with no SSR
const TrafficMap = dynamic(() => import('@/components/map/TrafficMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function Dashboard() {
  const [followEmergency, setFollowEmergency] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<{
    id: number;
    name: string;
  } | null>(null);
  
  const { stats, error: cameraError } = useCameraStats();
  const { status: lightStatus, error: lightError } = useTrafficLights();
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleEmergencyToggle = () => {
    setFollowEmergency(!followEmergency);
  };

  const handleCameraSelect = (camera: { id: number; name: string }) => {
    setSelectedCamera(camera);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Stats Section */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          <div className="bg-slate-800 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-md bg-blue-500/20 text-blue-500 flex items-center justify-center mr-4">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Intersections</p>
              <p className="text-2xl font-semibold">32</p>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center mr-4">
              <Car size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Traffic Flow</p>
              <p className="text-2xl font-semibold">Good</p>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Avg. Wait Time</p>
              <p className="text-2xl font-semibold">64s</p>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-md bg-red-500/20 text-red-500 flex items-center justify-center mr-4">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Alerts</p>
              <p className="text-2xl font-semibold">2</p>
            </div>
          </div>
        </div>

        {/* Main Map Section */}
        <div className="lg:col-span-8 h-[calc(100vh-16rem)]">
          {isClient && (
            <TrafficMap 
              followEmergency={followEmergency}
              onCameraSelect={handleCameraSelect}
            />
          )}
        </div>

        {/* Right Panel - Combined Camera and Alerts */}
        <div className="lg:col-span-4">
          <div className="bg-slate-800 rounded-lg p-4 h-[calc(100vh-16rem)] overflow-y-auto">
            {/* Camera Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center">
                  <Camera className="mr-2" size={18} />
                  Traffic Camera
                </h2>
                {selectedCamera && (
                  <button 
                    onClick={() => setSelectedCamera(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                )}
              </div>
              <div className="w-full h-64 bg-black rounded-lg overflow-hidden mb-4">
                {selectedCamera ? (
                  <CameraViewer 
                    cameraId={selectedCamera.id}
                    onClose={() => setSelectedCamera(null)}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Camera size={32} className="mb-2" />
                    <p>Click on a camera marker on the map</p>
                    <p className="text-sm">to view its live feed</p>
                  </div>
                )}
              </div>

              {/* Camera Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Vehicles Detected</p>
                  <p className="text-2xl font-semibold">
                    {stats?.counts.total || 0}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Northbound</p>
                  <p className="text-2xl font-semibold">
                    {stats?.counts.northbound || 0}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Southbound</p>
                  <p className="text-2xl font-semibold">
                    {stats?.counts.southbound || 0}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Traffic Flow</p>
                  <p className="text-2xl font-semibold text-emerald-500">
                    {stats?.counts.total ? (
                      stats.counts.total > 50 ? 'Heavy' : 
                      stats.counts.total > 20 ? 'Moderate' : 'Light'
                    ) : 'No Data'}
                  </p>
                </div>
              </div>

              {/* Lights Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Lightbulb className="mr-2" size={18} />
                  Traffic Lights
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* East Light */}
                  <div className="bg-slate-700/50 rounded-lg p-3 flex flex-col items-center">
                    <p className="text-slate-400 text-sm mb-2">East</p>
                    <div className={`w-6 h-6 rounded-full ${getLightColorClass(lightStatus.lights.east)}`}></div>
                  </div>
                  
                  {/* West Light */}
                  <div className="bg-slate-700/50 rounded-lg p-3 flex flex-col items-center">
                    <p className="text-slate-400 text-sm mb-2">West</p>
                    <div className={`w-6 h-6 rounded-full ${getLightColorClass(lightStatus.lights.west)}`}></div>
                  </div>
                  
                  {/* North Light */}
                  <div className="bg-slate-700/50 rounded-lg p-3 flex flex-col items-center">
                    <p className="text-slate-400 text-sm mb-2">North</p>
                    <div className={`w-6 h-6 rounded-full ${getLightColorClass(lightStatus.lights.north)}`}></div>
                  </div>
                  
                  {/* South Light Placeholder - REMOVED */}
                </div>
                {lightError && (
                  <p className="text-red-400 text-xs mt-2">Error fetching light data: {lightError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function for light color CSS
function getLightColorClass(color: LightColor): string {
  switch (color) {
    case 'red': return 'bg-red-500';
    case 'yellow': return 'bg-yellow-500';
    case 'green': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}
