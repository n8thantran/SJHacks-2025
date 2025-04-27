'use client';

import { usePathname } from 'next/navigation';
import { 
  Map, 
  BarChart, 
  AlertCircle, 
  Settings, 
  Cross, 
  Bell, 
  Clock, 
  Camera, 
  HelpCircle 
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
      setSystemStatus(prev => ({
        uptime: 97 + Math.random() * 2, // Random between 97-99
        responseTime: 90 + Math.random() * 30, // Random between 90-120
        lastCheck: 0
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Navigation item component
  const NavItem = ({ item }: { item: NavItem }) => {
    // Check if current path matches this nav item's href
    // For the root path ('/'), only match exactly, otherwise check if pathname starts with the href
    const isActive = 
      (item.href === '/' && pathname === '/') || 
      (item.href !== '/' && pathname.startsWith(item.href));
    
    return (
      <Link 
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'text-slate-300 hover:bg-slate-700'
        }`}
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
    <aside className="w-64 bg-card border-r border-border h-full py-6 hidden md:block">
      
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Main
        </h2>
        <nav>
          {mainNavItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
      
      <div className="px-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          System
        </h2>
        <nav>
          {secondaryNavItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto px-4 pt-6">
        <div className="bg-card/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-warning" />
            System Status
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            All systems operational. Last check: Now
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Uptime:</span>
            <span className="text-accent">{systemStatus.uptime.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">Response Time:</span>
            <span className="text-accent">{systemStatus.responseTime.toFixed(0)}ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
} 