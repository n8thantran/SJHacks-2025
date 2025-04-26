'use client';

import { useState } from 'react';
import { Cross, ChevronDown, Timer, Power, MapPin, Zap } from 'lucide-react';

// Mock intersection data
const intersections = [
  { id: 1, name: "1st & Santa Clara", status: "normal", automatic: true },
  { id: 2, name: "Market & San Carlos", status: "congested", automatic: true },
  { id: 3, name: "4th & San Fernando", status: "emergency", automatic: false },
  { id: 4, name: "10th & Santa Clara", status: "normal", automatic: true },
  { id: 5, name: "Monterey & Curtner", status: "normal", automatic: true },
];

interface SignalState {
  northSouth: string;
  eastWest: string;
  leftTurns: string;
  pedestrian: string;
  timeRemaining: number;
}

export default function IntersectionControl() {
  const [selectedIntersection, setSelectedIntersection] = useState(intersections[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAutomatic, setIsAutomatic] = useState(true);
  const [signalState, setSignalState] = useState<SignalState>({
    northSouth: 'green',
    eastWest: 'red',
    leftTurns: 'red',
    pedestrian: 'red',
    timeRemaining: 42
  });
  
  // Toggle automatic mode
  const toggleAutomatic = () => {
    setIsAutomatic(!isAutomatic);
  };
  
  // Handle signal phase change
  const changeSignalPhase = (phase: string) => {
    if (isAutomatic) return;
    
    switch(phase) {
      case 'north-south':
        setSignalState({
          northSouth: 'green',
          eastWest: 'red',
          leftTurns: 'red',
          pedestrian: 'red',
          timeRemaining: 45
        });
        break;
      case 'east-west':
        setSignalState({
          northSouth: 'red',
          eastWest: 'green',
          leftTurns: 'red',
          pedestrian: 'red',
          timeRemaining: 45
        });
        break;
      case 'left-turns':
        setSignalState({
          northSouth: 'red',
          eastWest: 'red',
          leftTurns: 'green',
          pedestrian: 'red',
          timeRemaining: 30
        });
        break;
      case 'pedestrian':
        setSignalState({
          northSouth: 'red',
          eastWest: 'red',
          leftTurns: 'red',
          pedestrian: 'green',
          timeRemaining: 20
        });
        break;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'normal': return 'bg-emerald-500';
      case 'congested': return 'bg-amber-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getSignalColor = (signal: string) => {
    switch(signal) {
      case 'green': return 'bg-emerald-500';
      case 'yellow': return 'bg-amber-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };
  
  return (
    <div className="bg-slate-800 p-4 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cross size={18} />
        Intersection Control
      </h2>
      
      {/* Intersection selector */}
      <div className="relative mb-4">
        <button 
          className="w-full p-2 bg-slate-700 rounded-md flex justify-between items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor(selectedIntersection.status)}`}></div>
            <span>{selectedIntersection.name}</span>
          </div>
          <ChevronDown size={18} />
        </button>
        
        {isDropdownOpen && (
          <ul className="absolute z-10 w-full mt-1 bg-slate-700 rounded-md overflow-hidden shadow-lg">
            {intersections.map(intersection => (
              <li 
                key={intersection.id}
                className="p-2 hover:bg-slate-600 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  setSelectedIntersection(intersection);
                  setIsAutomatic(intersection.automatic);
                  setIsDropdownOpen(false);
                }}
              >
                <div className={`h-3 w-3 rounded-full ${getStatusColor(intersection.status)}`}></div>
                {intersection.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Control mode toggle */}
      <div className="flex items-center justify-between bg-slate-700 p-3 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-slate-400" />
          <span>Control Mode</span>
        </div>
        <button 
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAutomatic ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
          }`}
          onClick={toggleAutomatic}
        >
          {isAutomatic ? 'Automatic' : 'Manual'}
        </button>
      </div>
      
      {/* Current signal status */}
      <div className="bg-slate-700 p-3 rounded-md mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-slate-300">Current Signal Status</h3>
          <div className="flex items-center gap-1 text-xs">
            <Timer size={14} className="text-slate-400" />
            <span className="text-white font-medium">{signalState.timeRemaining}s</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${getSignalColor(signalState.northSouth)}`}></div>
            <span className="text-sm">North-South</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${getSignalColor(signalState.eastWest)}`}></div>
            <span className="text-sm">East-West</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${getSignalColor(signalState.leftTurns)}`}></div>
            <span className="text-sm">Left Turns</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${getSignalColor(signalState.pedestrian)}`}></div>
            <span className="text-sm">Pedestrian</span>
          </div>
        </div>
      </div>
      
      {/* Manual controls (disabled in automatic mode) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Manual Controls</h3>
        <button 
          className={`w-full p-2 rounded-md text-sm font-medium mb-2 flex items-center justify-center gap-2 ${
            isAutomatic ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
          }`}
          onClick={() => changeSignalPhase('north-south')}
          disabled={isAutomatic}
        >
          <MapPin size={14} />
          North-South Green
        </button>
        
        <button 
          className={`w-full p-2 rounded-md text-sm font-medium mb-2 flex items-center justify-center gap-2 ${
            isAutomatic ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
          }`}
          onClick={() => changeSignalPhase('east-west')}
          disabled={isAutomatic}
        >
          <MapPin size={14} className="rotate-90" />
          East-West Green
        </button>
        
        <button 
          className={`w-full p-2 rounded-md text-sm font-medium mb-2 flex items-center justify-center gap-2 ${
            isAutomatic ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
          }`}
          onClick={() => changeSignalPhase('left-turns')}
          disabled={isAutomatic}
        >
          <Cross size={14} />
          Left Turns Green
        </button>
        
        <button 
          className={`w-full p-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
            isAutomatic ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
          }`}
          onClick={() => changeSignalPhase('pedestrian')}
          disabled={isAutomatic}
        >
          <Zap size={14} />
          Emergency Override
        </button>
      </div>
    </div>
  );
} 