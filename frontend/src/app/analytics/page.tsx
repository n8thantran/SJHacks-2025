'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowRight, TrendingUp, AlertTriangle, Activity, Clock, Calendar, MapPin, Car, Zap, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

// Mock data for traffic prediction throughout the day
const hourlyTrafficData = [
  { hour: '00:00', actual: 120, predicted: 110, threshold: 500 },
  { hour: '01:00', actual: 80, predicted: 75, threshold: 500 },
  { hour: '02:00', actual: 40, predicted: 50, threshold: 500 },
  { hour: '03:00', actual: 30, predicted: 40, threshold: 500 },
  { hour: '04:00', actual: 50, predicted: 60, threshold: 500 },
  { hour: '05:00', actual: 150, predicted: 140, threshold: 500 },
  { hour: '06:00', actual: 320, predicted: 300, threshold: 500 },
  { hour: '07:00', actual: 580, predicted: 550, threshold: 500 },
  { hour: '08:00', actual: 820, predicted: 780, threshold: 500 },
  { hour: '09:00', actual: 720, predicted: 700, threshold: 500 },
  { hour: '10:00', actual: 500, predicted: 520, threshold: 500 },
  { hour: '11:00', actual: 450, predicted: 480, threshold: 500 },
  { hour: '12:00', actual: 550, predicted: 530, threshold: 500 },
  { hour: '13:00', actual: 580, predicted: 570, threshold: 500 },
  { hour: '14:00', actual: 500, predicted: 510, threshold: 500 },
  { hour: '15:00', actual: 520, predicted: 530, threshold: 500 },
  { hour: '16:00', actual: 620, predicted: 650, threshold: 500 },
  { hour: '17:00', actual: 780, predicted: 820, threshold: 500 },
  { hour: '18:00', actual: 830, predicted: 850, threshold: 500 },
  { hour: '19:00', actual: 720, predicted: 700, threshold: 500 },
  { hour: '20:00', actual: 550, predicted: 530, threshold: 500 },
  { hour: '21:00', actual: 400, predicted: 420, threshold: 500 },
  { hour: '22:00', actual: 280, predicted: 290, threshold: 500 },
  { hour: '23:00', actual: 170, predicted: 180, threshold: 500 },
];

// Mock data for direction distribution
const trafficDirectionData = [
  { name: 'North to South', value: 35 },
  { name: 'South to North', value: 40 },
  { name: 'East to West', value: 15 },
  { name: 'West to East', value: 10 },
];

// Mock data for vehicle types
const vehicleTypeData = [
  { name: 'Passenger Cars', value: 65 },
  { name: 'SUVs', value: 20 },
  { name: 'Trucks', value: 8 },
  { name: 'Buses', value: 4 },
  { name: 'Motorcycles', value: 3 },
];

// Mock data for intersection congestion
const intersectionData = [
  { name: 'Main St & 5th Ave', congestion: 85, waitTime: 210, biasActive: true },
  { name: 'Broadway & 7th', congestion: 92, waitTime: 290, biasActive: true },
  { name: 'Market St & San Carlos', congestion: 68, waitTime: 140, biasActive: true },
  { name: 'Almaden & Curtner', congestion: 42, waitTime: 80, biasActive: false },
  { name: 'Winchester & Stevens Creek', congestion: 56, waitTime: 95, biasActive: false },
];

// Mock data for weekly pattern
const weeklyPatternData = [
  { day: 'Mon', traffic: 720, congestion: 76 },
  { day: 'Tue', traffic: 680, congestion: 72 },
  { day: 'Wed', traffic: 650, congestion: 68 },
  { day: 'Thu', traffic: 710, congestion: 74 },
  { day: 'Fri', traffic: 830, congestion: 88 },
  { day: 'Sat', traffic: 720, congestion: 74 },
  { day: 'Sun', traffic: 550, congestion: 58 },
];

// Custom chart colors
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#84cc16'];

export default function AnalyticsPage() {
  const [selectedIntersection, setSelectedIntersection] = useState('Main St & 5th Ave');
  const [timeRange, setTimeRange] = useState('24h');
  
  // Find intersections that have bias active
  const biasedIntersections = intersectionData.filter(item => item.biasActive);
  
  // Calculate average wait time
  const avgWaitTime = Math.round(
    intersectionData.reduce((acc, item) => acc + item.waitTime, 0) / intersectionData.length
  );
  
  // Find peak hours (hours with traffic above threshold)
  const peakHours = hourlyTrafficData.filter(item => item.actual > item.threshold);
  
  // Custom tooltip for the traffic prediction chart
  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: {value: number}[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg">
          <p className="font-medium text-white">{`${label}`}</p>
          <p className="text-blue-400">{`Actual: ${payload[0].value} vehicles`}</p>
          <p className="text-purple-400">{`Predicted: ${payload[1].value} vehicles`}</p>
          {payload[0].value > payload[2].value && (
            <p className="text-amber-400 mt-1 flex items-center text-xs">
              <AlertTriangle size={12} className="mr-1" />
              Above threshold - Light bias active
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="p-4 pb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <BarChart2 className="mr-2" size={24} />
            <h1 className="text-2xl font-bold">Traffic Analytics & Prediction</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedIntersection}
              onChange={(e) => setSelectedIntersection(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {intersectionData.map(item => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
        
        {/* Analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Biased Intersections</h3>
              <span className={`text-xs ${biasedIntersections.length > 2 ? 'text-amber-400' : 'text-green-400'} flex items-center`}>
                {biasedIntersections.length > 2 ? <AlertTriangle size={12} className="mr-0.5" /> : null}
                {biasedIntersections.length}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{biasedIntersections.length}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Intersections with active bias
                </div>
              </div>
              <div className="flex-shrink-0">
                <Zap size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Peak Traffic Hours</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{peakHours.length}</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Hours above threshold today
                </div>
              </div>
              <div className="flex-shrink-0">
                <Clock size={24} className="text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Avg Wait Time</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">{avgWaitTime} sec</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Across all intersections
                </div>
              </div>
              <div className="flex-shrink-0">
                <Activity size={24} className="text-purple-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-slate-400 text-sm font-medium">Prediction Accuracy</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold">94.7%</span>
                <div className="flex mt-1 text-xs text-slate-400">
                  Based on historical data
                </div>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp size={24} className="text-green-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Traffic Prediction Graph */}
        <div className="mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <Car className="mr-2" size={18} />
                Traffic Prediction at {selectedIntersection}
              </h2>
              <div className="flex items-center text-sm text-amber-400">
                <AlertTriangle size={14} className="mr-1" />
                Threshold for light bias: 500 vehicles/hour
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyTrafficData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="hour" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="threshold"
                    stroke="#f97316"
                    strokeDasharray="5 5"
                    fill="none"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    name="Bias Threshold"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                    name="Actual Traffic"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name="Predicted Traffic"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 bg-slate-700/30 p-3 rounded-md">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <AlertTriangle className="text-amber-500" size={16} />
                </div>
                <div className="text-sm">
                  <p className="text-slate-200">Traffic reaching the threshold of 500 vehicles per hour triggers automated light bias.</p>
                  <p className="text-slate-400 mt-1">Based on ML prediction, the system is currently biasing traffic lights to favor the primary direction at this intersection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Pattern */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Calendar className="mr-2" size={18} />
              Weekly Traffic Pattern
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyPatternData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="traffic" name="Vehicle Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="congestion" name="Congestion %" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Intersection Comparison */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <MapPin className="mr-2" size={18} />
              Intersection Congestion Comparison
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={intersectionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                  <XAxis type="number" tick={{ fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Bar dataKey="congestion" name="Congestion %" fill="#f97316">
                    {intersectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.biasActive ? '#f97316' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded mr-1"></span>
                <span>Light bias active</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded mr-1"></span>
                <span>Normal operation</span>
              </div>
            </div>
          </div>
          
          {/* Traffic Direction Distribution */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <ArrowRight className="mr-2" size={18} />
              Traffic Direction Distribution
            </h2>
            <div className="flex">
              <div className="h-64 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficDirectionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {trafficDirectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                      itemStyle={{ color: '#ffffff' }}
                      formatter={(value) => [`${value}%`, 'Traffic Percentage']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 px-4">
                <h3 className="text-sm font-medium mb-2">Direction Analysis</h3>
                <div className="text-xs space-y-2">
                  <p className="text-slate-300">North-South corridor shows highest volume (75%)</p>
                  <p className="text-slate-300">Primary bias direction: <span className="text-amber-400">South to North</span></p>
                  <p className="text-slate-300">East-West traffic remains below threshold</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vehicle Type Distribution */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <PieChartIcon className="mr-2" size={18} />
              Vehicle Type Distribution
            </h2>
            <div className="flex">
              <div className="h-64 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                      itemStyle={{ color: '#ffffff' }}
                      formatter={(value) => [`${value}%`, 'Percentage']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 px-4">
                <h3 className="text-sm font-medium mb-2">ML-Derived Insights</h3>
                <div className="text-xs space-y-2">
                  <p className="text-slate-300">High commuter traffic pattern (85% passenger vehicles)</p>
                  <p className="text-slate-300">Commercial vehicles (trucks & buses): <span className="text-blue-400">12%</span></p>
                  <p className="text-slate-300">Public transportation priority enabled at peak hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Technical Analysis Panel */}
        <div className="bg-slate-800 rounded-lg p-4 mb-10">
          <h2 className="text-lg font-medium mb-3">Predictive Algorithm Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-slate-300 mb-1">Prediction Model</h3>
              <p className="text-xs text-slate-400">Bayesian Network + LSTM</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">Confidence</span>
                <span className="text-sm text-green-400">95.2%</span>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-slate-300 mb-1">Feature Importance</h3>
              <p className="text-xs text-slate-400">Historical + Weather + Events</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">Weather Impact</span>
                <span className="text-sm text-blue-400">High</span>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-slate-300 mb-1">Training Cycles</h3>
              <p className="text-xs text-slate-400">Daily re-training with new data</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">Last Updated</span>
                <span className="text-sm text-blue-400">Today 04:30 AM</span>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-slate-300 mb-1">Bias Configuration</h3>
              <p className="text-xs text-slate-400">Adaptive threshold optimization</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">Update Frequency</span>
                <span className="text-sm text-blue-400">15 min</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700/30 p-3 rounded-md text-sm">
            <h3 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="mr-2 text-amber-500" size={16} />
              Current System Status
            </h3>
            <p className="text-slate-300 mb-2">The traffic prediction system is currently biasing traffic lights at <span className="text-amber-400">{biasedIntersections.length} intersections</span> based on ML-driven congestion analysis.</p>
            <p className="text-slate-400">The bias algorithm adjusts light timing to favor directions with vehicle counts exceeding the configured threshold (500 veh/hr), reducing average wait times by up to 42% during peak hours. The system analyzes real-time traffic patterns and historical data to predict congestion 30-60 minutes in advance.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 