'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Crosshair, Search, Filter, Map, ArrowDown, ArrowUp, BarChart4, Activity, AlertTriangle, Check, Clock, RefreshCw, ChevronDown, ChevronRight, Info, Eye } from 'lucide-react';

// Mock intersections data
const mockIntersections = [
  {
    id: 1,
    name: 'Main St & 5th Ave',
    location: {
      latitude: 37.335480,
      longitude: -121.893028,
      district: 'Downtown'
    },
    status: 'optimal',
    trafficFlow: 'heavy',
    lastUpdated: new Date(2025, 3, 15, 17, 30),
    signalType: 'adaptive',
    cameras: 3,
    sensors: 8,
    crosswalks: 4,
    incidents: 0,
    avgWaitTime: '45 sec',
    peakHour: '5:00 PM - 6:00 PM',
    trafficVolume: {
      current: 950,
      daily: 24500,
      trend: '+12%'
    },
    trafficByDirection: {
      north: 280,
      south: 310,
      east: 190,
      west: 170
    },
    pedestrianActivity: 'high',
    maintenanceStatus: 'normal',
    lastMaintenance: new Date(2025, 2, 20),
    nextMaintenance: new Date(2025, 6, 20)
  },
  {
    id: 2,
    name: 'Broadway & 7th',
    location: {
      latitude: 37.338220,
      longitude: -121.886420,
      district: 'Theater District'
    },
    status: 'issue',
    trafficFlow: 'moderate',
    lastUpdated: new Date(2025, 3, 15, 17, 15),
    signalType: 'fixed',
    cameras: 2,
    sensors: 6,
    crosswalks: 4,
    incidents: 1,
    avgWaitTime: '90 sec',
    peakHour: '5:30 PM - 6:30 PM',
    trafficVolume: {
      current: 720,
      daily: 18900,
      trend: '+5%'
    },
    trafficByDirection: {
      north: 230,
      south: 250,
      east: 140,
      west: 100
    },
    pedestrianActivity: 'very high',
    maintenanceStatus: 'pending',
    lastMaintenance: new Date(2024, 11, 10),
    nextMaintenance: new Date(2025, 3, 25)
  },
  {
    id: 3,
    name: 'Market St & San Carlos',
    location: {
      latitude: 37.329952,
      longitude: -121.885426,
      district: 'Downtown'
    },
    status: 'optimal',
    trafficFlow: 'moderate',
    lastUpdated: new Date(2025, 3, 15, 17, 25),
    signalType: 'adaptive',
    cameras: 4,
    sensors: 10,
    crosswalks: 6,
    incidents: 0,
    avgWaitTime: '35 sec',
    peakHour: '8:00 AM - 9:00 AM',
    trafficVolume: {
      current: 820,
      daily: 22100,
      trend: '+8%'
    },
    trafficByDirection: {
      north: 210,
      south: 240,
      east: 180,
      west: 190
    },
    pedestrianActivity: 'high',
    maintenanceStatus: 'normal',
    lastMaintenance: new Date(2025, 1, 5),
    nextMaintenance: new Date(2025, 7, 5)
  },
  {
    id: 4,
    name: 'Highway 101 & Exit 25',
    location: {
      latitude: 37.356812,
      longitude: -121.901840,
      district: 'North County'
    },
    status: 'attention',
    trafficFlow: 'congested',
    lastUpdated: new Date(2025, 3, 15, 17, 20),
    signalType: 'adaptive',
    cameras: 6,
    sensors: 14,
    crosswalks: 2,
    incidents: 1,
    avgWaitTime: '110 sec',
    peakHour: '4:30 PM - 5:30 PM',
    trafficVolume: {
      current: 1250,
      daily: 42500,
      trend: '+18%'
    },
    trafficByDirection: {
      north: 380,
      south: 420,
      east: 250,
      west: 200
    },
    pedestrianActivity: 'low',
    maintenanceStatus: 'normal',
    lastMaintenance: new Date(2025, 3, 1),
    nextMaintenance: new Date(2025, 6, 1)
  },
  {
    id: 5,
    name: 'Almaden & Curtner',
    location: {
      latitude: 37.287048,
      longitude: -121.867973,
      district: 'South Side'
    },
    status: 'optimal',
    trafficFlow: 'light',
    lastUpdated: new Date(2025, 3, 15, 17, 10),
    signalType: 'fixed',
    cameras: 2,
    sensors: 6,
    crosswalks: 4,
    incidents: 0,
    avgWaitTime: '25 sec',
    peakHour: '7:30 AM - 8:30 AM',
    trafficVolume: {
      current: 510,
      daily: 14800,
      trend: '+3%'
    },
    trafficByDirection: {
      north: 130,
      south: 150,
      east: 120,
      west: 110
    },
    pedestrianActivity: 'medium',
    maintenanceStatus: 'normal',
    lastMaintenance: new Date(2025, 2, 10),
    nextMaintenance: new Date(2025, 8, 10)
  },
  {
    id: 6,
    name: 'Winchester & Stevens Creek',
    location: {
      latitude: 37.323848,
      longitude: -121.952858,
      district: 'West End'
    },
    status: 'issue',
    trafficFlow: 'moderate',
    lastUpdated: new Date(2025, 3, 15, 16, 45),
    signalType: 'semi-adaptive',
    cameras: 3,
    sensors: 8,
    crosswalks: 4,
    incidents: 2,
    avgWaitTime: '75 sec',
    peakHour: '6:00 PM - 7:00 PM',
    trafficVolume: {
      current: 680,
      daily: 19200,
      trend: '+7%'
    },
    trafficByDirection: {
      north: 160,
      south: 180,
      east: 170,
      west: 170
    },
    pedestrianActivity: 'medium',
    maintenanceStatus: 'scheduled',
    lastMaintenance: new Date(2024, 10, 15),
    nextMaintenance: new Date(2025, 3, 20)
  },
  {
    id: 7,
    name: 'East Lake Drive & Commerce',
    location: {
      latitude: 37.344418,
      longitude: -121.835060,
      district: 'East District'
    },
    status: 'optimal',
    trafficFlow: 'light',
    lastUpdated: new Date(2025, 3, 15, 17, 5),
    signalType: 'fixed',
    cameras: 2,
    sensors: 6,
    crosswalks: 2,
    incidents: 0,
    avgWaitTime: '20 sec',
    peakHour: '7:00 AM - 8:00 AM',
    trafficVolume: {
      current: 420,
      daily: 11500,
      trend: '+2%'
    },
    trafficByDirection: {
      north: 110,
      south: 130,
      east: 90,
      west: 90
    },
    pedestrianActivity: 'low',
    maintenanceStatus: 'normal',
    lastMaintenance: new Date(2025, 1, 25),
    nextMaintenance: new Date(2025, 7, 25)
  },
  {
    id: 8,
    name: 'Industrial Pkwy & Factory Rd',
    location: {
      latitude: 37.360661,
      longitude: -121.879883,
      district: 'Industrial Zone'
    },
    status: 'optimal',
    trafficFlow: 'moderate',
    lastUpdated: new Date(2025, 3, 15, 16, 55),
    signalType: 'semi-adaptive',
    cameras: 2,
    sensors: 8,
    crosswalks: 2,
    incidents: 0,
    avgWaitTime: '30 sec',
    peakHour: '4:00 PM - 5:00 PM',
    trafficVolume: {
      current: 580,
      daily: 15800,
      trend: '+6%'
    },
    trafficByDirection: {
      north: 150,
      south: 160,
      east: 130,
      west: 140
    },
    pedestrianActivity: 'very low',
    maintenanceStatus: 'normal',
    lastMaintenance: new Date(2025, 0, 15),
    nextMaintenance: new Date(2025, 6, 15)
  }
];

// Traffic summary data
const trafficSummary = {
  totalIntersections: 85,
  optimalStatus: 68,
  attentionRequired: 12,
  issueDetected: 5,
  totalActiveVolume: 5930,
  averageWaitTime: '48 sec',
  totalPedestrianActivity: 12540,
  pendingMaintenance: 3
};

export default function IntersectionsPage() {
  const [intersections] = useState(mockIntersections);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [trafficFilter, setTrafficFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'trafficVolume',
    direction: 'desc'
  });
  const [expandedView, setExpandedView] = useState<number | null>(null);
  
  // Filter intersections
  const filteredIntersections = intersections.filter(intersection => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!intersection.name.toLowerCase().includes(searchLower) &&
          !intersection.location.district.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all' && intersection.status !== statusFilter) {
      return false;
    }
    
    // District filter
    if (districtFilter !== 'all' && intersection.location.district !== districtFilter) {
      return false;
    }
    
    // Traffic flow filter
    if (trafficFilter !== 'all' && intersection.trafficFlow !== trafficFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort intersections
  const sortedIntersections = [...filteredIntersections].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortConfig.key === 'trafficVolume') {
      return sortConfig.direction === 'asc'
        ? a.trafficVolume.current - b.trafficVolume.current
        : b.trafficVolume.current - a.trafficVolume.current;
    }
    
    if (sortConfig.key === 'waitTime') {
      const getSeconds = (timeStr: string) => parseInt(timeStr.split(' ')[0]);
      return sortConfig.direction === 'asc'
        ? getSeconds(a.avgWaitTime) - getSeconds(b.avgWaitTime)
        : getSeconds(b.avgWaitTime) - getSeconds(a.avgWaitTime);
    }
    
    return 0;
  });
  
  // Handle sort change
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  // Toggle intersection expanded view
  const toggleExpandedView = (id: number) => {
    setExpandedView(expandedView === id ? null : id);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-green-900/40 text-green-200 text-xs"><Check size={12} className="mr-1" /> Optimal</span>;
      case 'attention':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-200 text-xs"><AlertTriangle size={12} className="mr-1" /> Attention</span>;
      case 'issue':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-red-900/40 text-red-200 text-xs"><AlertTriangle size={12} className="mr-1" /> Issue</span>;
      default:
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-xs">Unknown</span>;
    }
  };
  
  // Get traffic flow badge
  const getTrafficFlowBadge = (flow: string) => {
    switch (flow) {
      case 'light':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200 text-xs"><Activity size={12} className="mr-1" /> Light</span>;
      case 'moderate':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-green-900/40 text-green-200 text-xs"><Activity size={12} className="mr-1" /> Moderate</span>;
      case 'heavy':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-200 text-xs"><Activity size={12} className="mr-1" /> Heavy</span>;
      case 'congested':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-red-900/40 text-red-200 text-xs"><Activity size={12} className="mr-1" /> Congested</span>;
      default:
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-xs">Unknown</span>;
    }
  };
  
  // Render traffic direction visualization
  const renderTrafficDirections = (traffic: { north: number, south: number, east: number, west: number }) => {
    const maxValue = Math.max(traffic.north, traffic.south, traffic.east, traffic.west);
    const getPercentage = (value: number) => Math.round((value / maxValue) * 100);
    
    return (
      <div className="grid grid-cols-3 gap-1 mt-3">
        <div className="text-center">
          <div className="h-20 flex flex-col items-center justify-end">
            <div className="text-xs text-slate-400 mb-1">{traffic.north}</div>
            <div className="w-4 bg-blue-600/70" style={{ height: `${getPercentage(traffic.north)}%` }}></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">North</div>
        </div>
        <div className="row-span-3 col-span-1 flex flex-col items-center justify-center">
          <div className="grid grid-cols-3 items-center">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">{traffic.west}</div>
              <div className="h-4 bg-blue-600/70" style={{ width: `${getPercentage(traffic.west)}%` }}></div>
              <div className="text-xs text-slate-400 mt-1">West</div>
            </div>
            <div className="text-center">
              <Crosshair size={20} className="mx-auto text-slate-400" />
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">{traffic.east}</div>
              <div className="h-4 bg-blue-600/70" style={{ width: `${getPercentage(traffic.east)}%` }}></div>
              <div className="text-xs text-slate-400 mt-1">East</div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="h-20 flex flex-col items-center justify-start">
            <div className="w-4 bg-blue-600/70" style={{ height: `${getPercentage(traffic.south)}%` }}></div>
            <div className="text-xs text-slate-400 mt-1">{traffic.south}</div>
          </div>
          <div className="text-xs text-slate-400 mt-1">South</div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Crosshair className="mr-2" size={24} />
            <h1 className="text-2xl font-bold">Traffic Intersections</h1>
          </div>
          <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-md flex items-center">
            <RefreshCw size={16} className="mr-1" />
            Refresh Data
          </button>
        </div>
        
        {/* Analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Status Overview</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{trafficSummary.totalIntersections}</span>
                <div className="flex mt-1 text-xs">
                  <span className="text-green-400 mr-2">{trafficSummary.optimalStatus} optimal</span>
                  <span className="text-amber-400 mr-2">{trafficSummary.attentionRequired} attention</span>
                  <span className="text-red-400">{trafficSummary.issueDetected} issues</span>
                </div>
              </div>
              <div className="flex">
                <span className="bg-green-800/40 w-6 h-24 rounded mr-1"></span>
                <span className="bg-amber-800/40 w-6 h-10 rounded mr-1"></span>
                <span className="bg-red-800/40 w-6 h-6 rounded"></span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Current Traffic Volume</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{trafficSummary.totalActiveVolume}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  vehicles across monitored intersections
                </div>
              </div>
              <div className="flex-shrink-0">
                <BarChart4 size={24} className="text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Average Wait Time</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{trafficSummary.averageWaitTime}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  across all intersections
                </div>
              </div>
              <div className="flex-shrink-0">
                <Clock size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Maintenance</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{trafficSummary.pendingMaintenance}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  intersections pending maintenance
                </div>
              </div>
              <div className="flex-shrink-0">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="bg-slate-800 rounded-lg flex-1 min-w-[240px] max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search intersections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 flex items-center">
              <Filter size={14} className="mr-1" /> Filter:
            </span>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="optimal">Optimal</option>
              <option value="attention">Attention</option>
              <option value="issue">Issue</option>
            </select>
            
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Districts</option>
              <option value="Downtown">Downtown</option>
              <option value="Theater District">Theater District</option>
              <option value="North County">North County</option>
              <option value="South Side">South Side</option>
              <option value="West End">West End</option>
              <option value="East District">East District</option>
              <option value="Industrial Zone">Industrial Zone</option>
            </select>
            
            <select
              value={trafficFilter}
              onChange={(e) => setTrafficFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Traffic</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
              <option value="congested">Congested</option>
            </select>
          </div>
        </div>
        
        {/* Intersections table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left" style={{width: '30px'}}></th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center text-left font-medium"
                  >
                    Intersection
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp size={14} className="ml-1" /> : 
                        <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Traffic</th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('trafficVolume')}
                    className="flex items-center text-left font-medium"
                  >
                    Volume
                    {sortConfig.key === 'trafficVolume' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp size={14} className="ml-1" /> : 
                        <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('waitTime')}
                    className="flex items-center text-left font-medium"
                  >
                    Wait Time
                    {sortConfig.key === 'waitTime' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp size={14} className="ml-1" /> : 
                        <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left" style={{width: '120px'}}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedIntersections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No intersections match your current filters.
                  </td>
                </tr>
              ) : (
                sortedIntersections.map(intersection => (
                  <>
                    <tr key={intersection.id} className={`hover:bg-slate-750 ${expandedView === intersection.id ? 'bg-slate-750' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => toggleExpandedView(intersection.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {expandedView === intersection.id ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium">{intersection.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Map size={14} className="mr-1 text-slate-400" />
                          {intersection.location.district}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(intersection.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getTrafficFlowBadge(intersection.trafficFlow)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="font-medium">{intersection.trafficVolume.current}</span>
                          <span className="text-xs text-slate-400 ml-1">vehicles</span>
                          <span className={`text-xs ml-2 ${intersection.trafficVolume.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {intersection.trafficVolume.trend}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span>{intersection.avgWaitTime}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button className="p-1 text-slate-400 hover:text-blue-500 rounded" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-green-500 rounded" title="View Analytics">
                            <BarChart4 size={16} />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-slate-200 rounded" title="More Options">
                            <Info size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedView === intersection.id && (
                      <tr className="bg-slate-750">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <h4 className="font-medium mb-2">Intersection Details</h4>
                              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div className="text-slate-400">Signal Type:</div>
                                <div>{intersection.signalType}</div>
                                <div className="text-slate-400">Cameras:</div>
                                <div>{intersection.cameras}</div>
                                <div className="text-slate-400">Sensors:</div>
                                <div>{intersection.sensors}</div>
                                <div className="text-slate-400">Crosswalks:</div>
                                <div>{intersection.crosswalks}</div>
                                <div className="text-slate-400">Pedestrian Activity:</div>
                                <div>{intersection.pedestrianActivity}</div>
                                <div className="text-slate-400">Last Updated:</div>
                                <div>{formatTime(intersection.lastUpdated)}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium mb-2">Traffic Analysis</h4>
                              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div className="text-slate-400">Current Volume:</div>
                                <div>{intersection.trafficVolume.current} vehicles</div>
                                <div className="text-slate-400">Daily Average:</div>
                                <div>{intersection.trafficVolume.daily} vehicles</div>
                                <div className="text-slate-400">Trend:</div>
                                <div className={intersection.trafficVolume.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                                  {intersection.trafficVolume.trend}
                                </div>
                                <div className="text-slate-400">Peak Hours:</div>
                                <div>{intersection.peakHour}</div>
                                <div className="text-slate-400">Average Wait:</div>
                                <div>{intersection.avgWaitTime}</div>
                                <div className="text-slate-400">Incidents:</div>
                                <div>{intersection.incidents} active</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium mb-2">Traffic Flow by Direction</h4>
                              {renderTrafficDirections(intersection.trafficByDirection)}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <h4 className="font-medium mb-2">Maintenance Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-slate-400 mb-1">Status</div>
                                <div className="capitalize">{intersection.maintenanceStatus}</div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">Last Maintenance</div>
                                <div>{formatDate(intersection.lastMaintenance)}</div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">Next Scheduled</div>
                                <div>{formatDate(intersection.nextMaintenance)}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 