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
  const [lightCommandText, setLightCommandText] = useState('');
  const [sendCommandStatus, setSendCommandStatus] = useState('');
  
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
  
  const handleSendLightCommand = async () => {
    if (!lightCommandText.trim()) return;
    
    setSendCommandStatus('Sending...');
    try {
      const response = await fetch('http://localhost:5052/lights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: lightCommandText }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send command: ${response.status}`);
      }
      
      setLightCommandText('');
      setSendCommandStatus('Command sent!');
      console.log('Light command sent successfully');
      setTimeout(() => setSendCommandStatus(''), 3000);

    } catch (error) {
      console.error('Error sending light command:', error);
      setSendCommandStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setSendCommandStatus(''), 5000);
    }
  };

  // Automatically send random light commands every 10 seconds
  useEffect(() => {
    const messages = [
      "an ambulance is going west",
      "an ambulance is going east",
      "an ambulance is going north",
    ];
    const intervalId = setInterval(async () => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      console.log(`Sending command: ${randomMessage}`);
      try {
        const response = await fetch('http://localhost:5052/lights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: randomMessage }),
        });
        if (!response.ok) {
          console.error(`Failed to send command: ${response.status} ${await response.text()}`);
        } else {
          console.log('Automatic light command sent successfully');
        }
      } catch (error) {
        console.error('Error sending automatic light command:', error);
      }
    }, 10000); // 10 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once on mount

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
              <div className="w-full h-64 bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {selectedCamera ? (
                  selectedCamera.id === 1 ? (
                    <CameraViewer 
                      cameraId={selectedCamera.id}
                      onClose={() => setSelectedCamera(null)}
                    />
                  ) : (
                    // Placeholder for other cameras (like ID 2)
                    <div className="text-slate-400 p-4 text-center">
                      <Camera size={32} className="mb-2 mx-auto" />
                      <p>No live feed available for {selectedCamera.name}.</p>
                    </div>
                  )
                ) : (
                  // Placeholder when no camera is selected
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Camera size={32} className="mb-2" />
                    <p>Click on a camera marker on the map</p>
                    <p className="text-sm">to view its live feed</p>
                  </div>
                )}
              </div>

              {/* Camera Stats - Only show for Camera 1 */}
              {selectedCamera?.id === 1 && (
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
                    <p className={`text-2xl font-semibold ${getFlowColor(stats?.counts.total)}`}>
                      {getFlowText(stats?.counts.total)}
                    </p>
                  </div>
                </div>
              )}

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
                
                {/* Send Command Section */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <label htmlFor="lightCommand" className="block text-sm font-medium text-slate-400 mb-1">
                    Send Command:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="lightCommand"
                      value={lightCommandText}
                      onChange={(e) => setLightCommandText(e.target.value)}
                      placeholder="Enter command text..."
                      className="flex-grow bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendLightCommand}
                      disabled={!lightCommandText.trim() || sendCommandStatus === 'Sending...'}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm"
                    >
                      Send
                    </button>
                  </div>
                  {sendCommandStatus && (
                    <p className={`text-xs mt-1 ${sendCommandStatus.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                      {sendCommandStatus}
                    </p>
                  )}
                </div>
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

// Helper functions for Traffic Flow text and color
function getFlowText(total: number | undefined): string {
  if (total === undefined || total === null) return 'No Data';
  if (total > 50) return 'Heavy';
  if (total > 20) return 'Moderate';
  return 'Light';
}

function getFlowColor(total: number | undefined): string {
  if (total === undefined || total === null) return 'text-slate-400';
  if (total > 50) return 'text-red-500';
  if (total > 20) return 'text-amber-500'; // Changed moderate to amber
  return 'text-emerald-500';
}
