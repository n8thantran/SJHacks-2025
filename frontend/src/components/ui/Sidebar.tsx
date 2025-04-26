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
  { name: 'Notifications', icon: <Bell size={20} />, href: '/notifications' },
  { name: 'Schedule', icon: <Clock size={20} />, href: '/schedule' },
  { name: 'Cameras', icon: <Camera size={20} />, href: '/cameras' },
  { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  { name: 'Help & Support', icon: <HelpCircle size={20} />, href: '/help' },
];

export default function Sidebar() {
  const pathname = usePathname();
  
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
    <aside className="w-64 bg-slate-800 border-r border-slate-700 h-full py-6 hidden md:block">
      
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Main
        </h2>
        <nav>
          {mainNavItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
      
      <div className="px-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          System
        </h2>
        <nav>
          {secondaryNavItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto px-4 pt-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            System Status
          </h3>
          <p className="text-xs text-slate-300 mb-3">All systems operational. Last check: 5 minutes ago</p>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Uptime:</span>
            <span className="text-emerald-500">99.9%</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-400">Response Time:</span>
            <span className="text-emerald-500">120ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
} 