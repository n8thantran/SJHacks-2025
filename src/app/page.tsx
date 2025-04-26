'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AlertPanel from '@/components/alerts/AlertPanel';
import { MapPin, Car, Clock, AlertCircle } from 'lucide-react';
import StatisticsPanel from '@/components/dashboard/StatisticsPanel';

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
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleEmergencyToggle = () => {
    setFollowEmergency(!followEmergency);
  };
  
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-2">
        {/* Page Title */}
        <div className="lg:col-span-12 flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold">Traffic Dashboard</h1>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${
                followEmergency 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
              onClick={handleEmergencyToggle}
              disabled={!isClient}
            >
              <AlertCircle size={16} />
              {followEmergency ? 'Following Emergency' : 'Track Emergency Vehicles'}
            </button>
          </div>
        </div>
        
        {/* Status Cards */}
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
        <div className="lg:col-span-8 h-[500px] bg-slate-800 rounded-lg overflow-hidden">
          {isClient && <TrafficMap followEmergency={followEmergency} />}
        </div>
        
        {/* Right Panel - Alerts */}
        <div className="lg:col-span-4 h-[500px]">
          <AlertPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
