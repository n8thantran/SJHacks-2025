'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AlertTriangle, AlertCircle, Filter, Map, Clock, Search, ArrowUpDown, ArrowUp, ArrowDown, X, CheckCircle2, Activity } from 'lucide-react';

// Mock alerts data
const mockAlerts = [
  {
    id: 1,
    title: 'Heavy congestion detected',
    description: 'Traffic congestion exceeding 85% capacity at Main St & 5th Ave intersection',
    location: 'Main St & 5th Ave',
    timestamp: new Date(2025, 3, 15, 17, 23),
    severity: 'high',
    status: 'active',
    type: 'congestion',
    affectedVehicles: 278,
    averageDelay: '13 min',
    relatedIncidents: 2
  },
  {
    id: 2,
    title: 'Traffic signal malfunction',
    description: 'Signal timing error detected at Broadway & 7th intersection',
    location: 'Broadway & 7th',
    timestamp: new Date(2025, 3, 15, 16, 45),
    severity: 'critical',
    status: 'active',
    type: 'infrastructure',
    affectedVehicles: 354,
    averageDelay: '18 min',
    relatedIncidents: 0
  },
  {
    id: 3,
    title: 'Pedestrian crossing alert',
    description: 'Increased pedestrian volume at Market St & San Carlos',
    location: 'Market St & San Carlos',
    timestamp: new Date(2025, 3, 15, 12, 30),
    severity: 'medium',
    status: 'active',
    type: 'pedestrian',
    affectedVehicles: 127,
    averageDelay: '5 min',
    relatedIncidents: 1
  },
  {
    id: 4,
    title: 'Weather impact warning',
    description: 'Heavy rain affecting traffic flow across downtown area',
    location: 'Multiple intersections',
    timestamp: new Date(2025, 3, 15, 9, 15),
    severity: 'medium',
    status: 'active',
    type: 'weather',
    affectedVehicles: 1240,
    averageDelay: '8 min',
    relatedIncidents: 5
  },
  {
    id: 5,
    title: 'Road construction impact',
    description: 'Lane closure causing delays at Highway 101 & Exit 25',
    location: 'Highway 101 & Exit 25',
    timestamp: new Date(2025, 3, 15, 8, 0),
    severity: 'high',
    status: 'active',
    type: 'construction',
    affectedVehicles: 890,
    averageDelay: '15 min',
    relatedIncidents: 3
  },
  {
    id: 6,
    title: 'Traffic signal optimization',
    description: 'Automated signal timing adjustments at Almaden & Curtner',
    location: 'Almaden & Curtner',
    timestamp: new Date(2025, 3, 14, 22, 45),
    severity: 'low',
    status: 'resolved',
    type: 'optimization',
    affectedVehicles: 0,
    averageDelay: '0 min',
    relatedIncidents: 0
  },
  {
    id: 7,
    title: 'Accident cleared',
    description: 'Traffic accident cleared at Winchester & Stevens Creek',
    location: 'Winchester & Stevens Creek',
    timestamp: new Date(2025, 3, 14, 18, 30),
    severity: 'high',
    status: 'resolved',
    type: 'accident',
    affectedVehicles: 0,
    averageDelay: '0 min',
    relatedIncidents: 0
  },
  {
    id: 8,
    title: 'Public event traffic plan',
    description: 'Traffic management plan for downtown concert',
    location: 'City Center District',
    timestamp: new Date(2025, 3, 16, 18, 0),
    severity: 'medium',
    status: 'scheduled',
    type: 'event',
    affectedVehicles: 0,
    averageDelay: '0 min',
    relatedIncidents: 0
  }
];

// Analytics summary data
const alertsSummary = {
  active: 5,
  resolved: 2,
  scheduled: 1,
  criticalCount: 1,
  highCount: 3,
  totalDelayMinutes: 59,
  totalAffectedVehicles: 2889,
  comparedToYesterday: '+15%'
};

export default function AlertsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  // Filter alerts based on filters
  const filteredAlerts = mockAlerts.filter(alert => {
    // Status filter
    if (filters.status !== 'all' && alert.status !== filters.status) return false;
    
    // Severity filter
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
    
    // Type filter
    if (filters.type !== 'all' && alert.type !== filters.type) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        alert.title.toLowerCase().includes(searchLower) || 
        alert.description.toLowerCase().includes(searchLower) || 
        alert.location.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort alerts
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortConfig.key === 'timestamp') {
      return sortConfig.direction === 'asc' 
        ? a.timestamp.getTime() - b.timestamp.getTime()
        : b.timestamp.getTime() - a.timestamp.getTime();
    }
    
    if (sortConfig.key === 'severity') {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return sortConfig.direction === 'asc'
        ? severityOrder[a.severity] - severityOrder[b.severity]
        : severityOrder[b.severity] - severityOrder[a.severity];
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
  
  // Function to format date
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Function to get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-red-900 text-red-200 text-xs"><AlertCircle size={12} className="mr-1" /> Critical</span>;
      case 'high':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-amber-900 text-amber-200 text-xs"><AlertTriangle size={12} className="mr-1" /> High</span>;
      case 'medium':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-yellow-900 text-yellow-200 text-xs"><AlertTriangle size={12} className="mr-1" /> Medium</span>;
      case 'low':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-xs"><AlertTriangle size={12} className="mr-1" /> Low</span>;
      default:
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-xs">Unknown</span>;
    }
  };
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-red-900/40 text-red-200 text-xs"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Active</span>;
      case 'resolved':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-green-900/40 text-green-200 text-xs"><CheckCircle2 size={12} className="mr-1" /> Resolved</span>;
      case 'scheduled':
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200 text-xs"><Clock size={12} className="mr-1" /> Scheduled</span>;
      default:
        return <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-xs">Unknown</span>;
    }
  };
  
  // Get type icon
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'congestion':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'infrastructure':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'pedestrian':
        return <AlertTriangle size={16} className="text-blue-500" />;
      case 'weather':
        return <AlertTriangle size={16} className="text-cyan-500" />;
      case 'construction':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'optimization':
        return <Activity size={16} className="text-green-500" />;
      case 'accident':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'event':
        return <AlertTriangle size={16} className="text-purple-500" />;
      default:
        return <AlertTriangle size={16} className="text-slate-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <AlertTriangle className="mr-2" size={24} />
            <h1 className="text-2xl font-bold">Traffic Alerts</h1>
          </div>
          <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-md flex items-center">
            <Clock size={16} className="mr-1" />
            Schedule Alert
          </button>
        </div>
        
        {/* Analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Active Alerts</h3>
              <span className="text-amber-400 text-xs flex items-center">
                <ArrowUp size={12} className="mr-0.5" />{alertsSummary.comparedToYesterday}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{alertsSummary.active}</span>
                <div className="flex mt-1 text-xs">
                  <span className="text-red-400 mr-2">{alertsSummary.criticalCount} critical</span>
                  <span className="text-amber-400">{alertsSummary.highCount} high</span>
                </div>
              </div>
              <div className="flex">
                <span className="bg-red-800/40 w-4 h-12 rounded mr-1"></span>
                <span className="bg-amber-800/40 w-4 h-8 rounded mr-1"></span>
                <span className="bg-yellow-800/40 w-4 h-6 rounded mr-1"></span>
                <span className="bg-blue-800/40 w-4 h-4 rounded"></span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Resolved Today</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{alertsSummary.resolved}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Within last 24 hours
                </div>
              </div>
              <div className="flex-shrink-0">
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Total Delay Impact</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{alertsSummary.totalDelayMinutes} min</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Average across all incidents
                </div>
              </div>
              <div className="flex-shrink-0">
                <Clock size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Affected Vehicles</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{alertsSummary.totalAffectedVehicles.toLocaleString()}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Across all active incidents
                </div>
              </div>
              <div className="flex-shrink-0">
                <Activity size={24} className="text-blue-500" />
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
              placeholder="Search alerts..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 flex items-center">
              <Filter size={14} className="mr-1" /> Filter:
            </span>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="scheduled">Scheduled</option>
            </select>
            
            <select
              value={filters.severity}
              onChange={(e) => setFilters({...filters, severity: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="congestion">Congestion</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="pedestrian">Pedestrian</option>
              <option value="weather">Weather</option>
              <option value="construction">Construction</option>
              <option value="optimization">Optimization</option>
              <option value="accident">Accident</option>
              <option value="event">Event</option>
            </select>
            
            {(filters.status !== 'all' || filters.severity !== 'all' || filters.type !== 'all' || filters.search) && (
              <button 
                onClick={() => setFilters({status: 'all', severity: 'all', type: 'all', search: ''})}
                className="flex items-center text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700/50"
              >
                <X size={14} className="mr-1" /> Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Alerts table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Alert</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left" style={{width: '120px'}}>
                  <button 
                    onClick={() => handleSort('severity')}
                    className="flex items-center text-left font-medium"
                  >
                    Severity
                    {sortConfig.key === 'severity' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp size={14} className="ml-1" /> : 
                        <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left" style={{width: '120px'}}>Status</th>
                <th className="px-4 py-3 text-left" style={{width: '160px'}}>
                  <button 
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center text-left font-medium"
                  >
                    Time
                    {sortConfig.key === 'timestamp' && (
                      sortConfig.direction === 'asc' ? 
                        <ArrowUp size={14} className="ml-1" /> : 
                        <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left" style={{width: '100px'}}>Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No alerts match your current filters.
                  </td>
                </tr>
              ) : (
                sortedAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-750">
                    <td className="px-4 py-3">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          {getTypeIcon(alert.type)}
                        </div>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{alert.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Map size={14} className="mr-1 text-slate-400" />
                        {alert.location}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getSeverityBadge(alert.severity)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(alert.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-slate-400" />
                        {formatDate(alert.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        {alert.status === 'active' && (
                          <>
                            <span className="text-amber-400">{alert.averageDelay} delay</span>
                            <span className="text-xs text-slate-400 mt-0.5">{alert.affectedVehicles} vehicles</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 