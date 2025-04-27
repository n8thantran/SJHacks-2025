'use client';

import { usePathname } from 'next/navigation';
import { 
  Map, 
  BarChart, 
  AlertCircle, 
  Settings, 
  Cross, 
  Clock, 
  Camera 
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Navigation item interface
interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
}

// Navigation sections
const mainNavItems: NavItem[] = [
  { name: 'Dashboard', icon: <Map size={20} />, href: '/' },
  { name: 'Analytics', icon: <BarChart size={20} />, href: '/analytics' },
  { name: 'Alerts', icon: <AlertCircle size={20} />, href: '/alerts', count: 2 },
  { name: 'Intersections', icon: <Cross size={20} />, href: '/intersections' },
];

const secondaryNavItems: NavItem[] = [
  { name: 'Schedule', icon: <Clock size={20} />, href: '/schedule' },
  { name: 'Cameras', icon: <Camera size={20} />, href: '/cameras' },
  { name: 'Settings', icon: <Settings size={20} />, href: '/settings' }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [systemStatus, setSystemStatus] = useState({
    uptime: 98.5,
    responseTime: 105,
    lastCheck: 0
  });

  useEffect(() => {
    // Update system status every second
    const interval = setInterval(() => {
      setSystemStatus({
        uptime: 97 + Math.random() * 2, // Random between 97-99
        responseTime: 90 + Math.random() * 30, // Random between 90-120
        lastCheck: 0
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Navigation item component
  const NavItem = ({ item }: { item: NavItem }) => {
    // Enhanced isActive logic to properly handle route matching
    const isActive = 
      item.href === '/' 
        ? pathname === '/' 
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    
    return (
      <Link 
        href={item.href}
        className={`sidebar-button flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'text-slate-300 hover:bg-slate-700'
        }`}
        prefetch={true}
      >
        {item.icon}
        <span>{item.name}</span>
        {item.count && (
          <span className="ml-auto bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
            {item.count}
          </span>
        )}
      </Link>
    );
  };
  
  return (
    <aside className="w-64 h-full flex flex-col bg-card border-r border-border py-6 hidden md:flex">
      <div className="px-4 mb-6 flex-shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Main
        </h2>
        <nav>
          {mainNavItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
      
      <div className="px-4 flex-shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          System
        </h2>
        <nav>
          {secondaryNavItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto px-4 pt-6 flex-shrink-0 sticky bottom-0">
        <div className="bg-slate-800/70 rounded-lg shadow-lg border border-slate-700/50">
          <div className="p-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-400" />
                System Status
              </h3>
              <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-sm">Online</span>
            </div>
          </div>
          <div className="p-3">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Uptime:</span>
              <span className="text-emerald-400 font-medium">99.9%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Response Time:</span>
              <span className="text-blue-400 font-medium">{systemStatus.responseTime.toFixed(0)}ms</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
} 