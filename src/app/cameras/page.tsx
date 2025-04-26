'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Camera, MapPin, AlertTriangle, Search, Sliders, MoreVertical, Video, PauseCircle, RefreshCw, ChevronDown } from 'lucide-react';

// Mock camera data
const mockCameras = [
  {
    id: 1,
    name: 'Main St & 5th Ave',
    location: 'Downtown',
    status: 'online',
    lastMaintenance: '2023-10-15',
    ipAddress: '192.168.1.101',
    model: 'TrafficCam Pro X1',
    installDate: '2022-03-10',
    thumbnail: '/images/camera-feed-1.jpg',
  },
  {
    id: 2,
    name: 'Broadway & 7th',
    location: 'Theater District',
    status: 'offline',
    lastMaintenance: '2023-09-20',
    ipAddress: '192.168.1.102',
    model: 'TrafficCam Pro X1',
    installDate: '2022-02-15',
    thumbnail: '/images/camera-feed-2.jpg',
    issue: 'Connection error',
  },
  {
    id: 3,
    name: 'Highway 101 North, Exit 25',
    location: 'North County',
    status: 'online',
    lastMaintenance: '2023-11-05',
    ipAddress: '192.168.1.103',
    model: 'TrafficCam Pro X2',
    installDate: '2022-05-20',
    thumbnail: '/images/camera-feed-3.jpg',
  },
  {
    id: 4,
    name: 'Market St & San Carlos',
    location: 'Downtown',
    status: 'maintenance',
    lastMaintenance: '2023-11-10',
    ipAddress: '192.168.1.104',
    model: 'TrafficCam Pro X1',
    installDate: '2022-01-15',
    thumbnail: '/images/camera-feed-4.jpg',
    issue: 'Scheduled maintenance',
  },
  {
    id: 5,
    name: 'Almaden & Curtner',
    location: 'South Side',
    status: 'online',
    lastMaintenance: '2023-10-25',
    ipAddress: '192.168.1.105',
    model: 'TrafficCam Ultra HD',
    installDate: '2023-01-20',
    thumbnail: '/images/camera-feed-5.jpg',
  },
  {
    id: 6,
    name: 'West End Blvd & Park Ave',
    location: 'West End',
    status: 'warning',
    lastMaintenance: '2023-09-10',
    ipAddress: '192.168.1.106',
    model: 'TrafficCam Pro X2',
    installDate: '2022-06-15',
    thumbnail: '/images/camera-feed-6.jpg',
    issue: 'Poor video quality',
  },
  {
    id: 7,
    name: 'East Lake Drive',
    location: 'East District',
    status: 'online',
    lastMaintenance: '2023-10-30',
    ipAddress: '192.168.1.107',
    model: 'TrafficCam Ultra HD',
    installDate: '2023-02-10',
    thumbnail: '/images/camera-feed-7.jpg',
  },
  {
    id: 8,
    name: 'Industrial Pkwy & Commerce Ave',
    location: 'Industrial Zone',
    status: 'online',
    lastMaintenance: '2023-11-01',
    ipAddress: '192.168.1.108',
    model: 'TrafficCam Pro X2',
    installDate: '2022-09-15',
    thumbnail: '/images/camera-feed-8.jpg',
  },
];

export default function CamerasPage() {
  const [cameras] = useState(mockCameras);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="flex items-center px-2 py-0.5 text-xs rounded-full bg-green-900 text-green-200"><span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>Online</span>;
      case 'offline':
        return <span className="flex items-center px-2 py-0.5 text-xs rounded-full bg-red-900 text-red-200"><span className="w-2 h-2 mr-1 bg-red-400 rounded-full"></span>Offline</span>;
      case 'maintenance':
        return <span className="flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-900 text-blue-200"><span className="w-2 h-2 mr-1 bg-blue-400 rounded-full"></span>Maintenance</span>;
      case 'warning':
        return <span className="flex items-center px-2 py-0.5 text-xs rounded-full bg-amber-900 text-amber-200"><span className="w-2 h-2 mr-1 bg-amber-400 rounded-full"></span>Warning</span>;
      default:
        return <span className="flex items-center px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-200"><span className="w-2 h-2 mr-1 bg-slate-400 rounded-full"></span>Unknown</span>;
    }
  };
  
  // Filter cameras based on search and status
  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = searchQuery === '' || 
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || camera.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Toggle camera selection
  const toggleCameraSelection = (id: number) => {
    if (selectedCamera === id) {
      setSelectedCamera(null);
    } else {
      setSelectedCamera(id);
    }
  };
  
  // Render camera grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredCameras.map(camera => (
        <div 
          key={camera.id}
          className={`bg-slate-800 rounded-lg overflow-hidden border ${selectedCamera === camera.id ? 'border-blue-500' : 'border-slate-700'}`}
        >
          <div className="relative">
            <div className="aspect-video bg-slate-900 flex items-center justify-center">
              {/* We'd normally use real images but using a placeholder for mock */}
              <Camera size={48} className="text-slate-700" />
            </div>
            <div className="absolute top-2 right-2">
              {getStatusBadge(camera.status)}
            </div>
            {camera.status === 'online' && (
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <button className="p-1 bg-slate-800/70 rounded-full text-slate-300 hover:text-white">
                  <PauseCircle size={16} />
                </button>
                <button className="p-1 bg-slate-800/70 rounded-full text-slate-300 hover:text-white">
                  <Video size={16} />
                </button>
                <button className="p-1 bg-slate-800/70 rounded-full text-slate-300 hover:text-white">
                  <RefreshCw size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{camera.name}</h3>
              <button 
                onClick={() => toggleCameraSelection(camera.id)} 
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <MoreVertical size={16} />
              </button>
            </div>
            <div className="flex items-center text-xs text-slate-400 mt-1">
              <MapPin size={12} className="mr-1" />
              {camera.location}
            </div>
            {camera.issue && (
              <div className="flex items-center text-xs text-amber-400 mt-1">
                <AlertTriangle size={12} className="mr-1" />
                {camera.issue}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  
  // Render camera list view
  const renderListView = () => (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-700">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Location</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Model</th>
            <th className="px-4 py-3 text-left">Last Maintenance</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {filteredCameras.map(camera => (
            <tr key={camera.id} className="hover:bg-slate-750">
              <td className="px-4 py-3">{camera.name}</td>
              <td className="px-4 py-3">{camera.location}</td>
              <td className="px-4 py-3">{getStatusBadge(camera.status)}</td>
              <td className="px-4 py-3">{camera.model}</td>
              <td className="px-4 py-3">{camera.lastMaintenance}</td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button className="p-1 text-slate-400 hover:text-blue-500 rounded">
                    <Video size={16} />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-green-500 rounded">
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    onClick={() => toggleCameraSelection(camera.id)}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Camera className="mr-2" size={24} />
            <h1 className="text-2xl font-bold">Traffic Cameras</h1>
          </div>
          <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-md">
            Add Camera
          </button>
        </div>
        
        {/* Filters and controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex-1 min-w-[240px] max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cameras by name or location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="flex items-center px-3 py-2 bg-slate-800 border border-slate-700 rounded-md">
                <Sliders size={14} className="mr-2" />
                <span className="text-sm">Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
                <ChevronDown size={14} className="ml-2" />
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 hidden">
                <div className="py-1">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setStatusFilter('online')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                  >
                    Online
                  </button>
                  <button 
                    onClick={() => setStatusFilter('offline')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                  >
                    Offline
                  </button>
                  <button 
                    onClick={() => setStatusFilter('maintenance')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                  >
                    Maintenance
                  </button>
                  <button 
                    onClick={() => setStatusFilter('warning')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-700"
                  >
                    Warning
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-750'}`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-750'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
        
        {/* Camera count */}
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredCameras.length} of {cameras.length} cameras
        </div>
        
        {/* Camera display */}
        {filteredCameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-800 rounded-lg">
            <Camera size={48} className="mb-2" />
            <p className="text-lg">No cameras found</p>
            <p className="text-sm">Try adjusting your search or filter settings</p>
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </div>
    </DashboardLayout>
  );
} 