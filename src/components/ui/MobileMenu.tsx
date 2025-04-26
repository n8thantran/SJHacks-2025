'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import Link from 'next/link';
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

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;
  
  const pathname = usePathname();
  
  const mainNavItems = [
    { name: 'Dashboard', icon: <Map size={20} />, href: '/' },
    { name: 'Analytics', icon: <BarChart size={20} />, href: '/analytics' },
    { name: 'Alerts', icon: <AlertCircle size={20} />, href: '/alerts' },
    { name: 'Intersections', icon: <Cross size={20} />, href: '/intersections' },
  ];
  
  const secondaryNavItems = [
    { name: 'Notifications', icon: <Bell size={20} />, href: '/notifications' },
    { name: 'Schedule', icon: <Clock size={20} />, href: '/schedule' },
    { name: 'Cameras', icon: <Camera size={20} />, href: '/cameras' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
    { name: 'Help & Support', icon: <HelpCircle size={20} />, href: '/help' },
  ];
  
  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center">
          <div className="bg-blue-500 text-white h-8 w-8 rounded-md flex items-center justify-center font-bold mr-2">T</div>
          <h1 className="text-xl font-bold">TrafficO</h1>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-md hover:bg-slate-700"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4 flex-grow">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Main
        </h2>
        <div className="space-y-1 mb-6">
          {mainNavItems.map(item => {
            const isActive = 
              (item.href === '/' && pathname === '/') || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                href={item.href}
                key={item.name}
                className={`flex items-center gap-3 p-3 rounded-md ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          System
        </h2>
        <div className="space-y-1">
          {secondaryNavItems.map(item => {
            const isActive = 
              (item.href === '/' && pathname === '/') || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                href={item.href}
                key={item.name}
                className={`flex items-center gap-3 p-3 rounded-md ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <div className="font-medium">Traffic Admin</div>
            <div className="text-sm text-slate-400">San Jose DOT</div>
          </div>
        </div>
      </div>
    </div>
  );
} 