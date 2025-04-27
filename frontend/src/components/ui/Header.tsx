'use client';

import { useState } from 'react';
import { Search, Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import MobileMenu from './MobileMenu';
import Link from 'next/link';

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Mock notifications data
  const notifications = [
    { id: 1, type: 'warning', message: 'High traffic detected at Main St & 5th Ave', time: '2 mins ago' },
    { id: 2, type: 'critical', message: 'Signal malfunction at Oak St & Pine Ave', time: '5 mins ago' },
    { id: 3, type: 'info', message: 'System update completed successfully', time: '1 hour ago' },
    { id: 4, type: 'success', message: 'Traffic flow improved at Park Ave', time: '2 hours ago' }
  ];
  
  return (
    <>
      <header className="bg-background/50 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md hover:bg-background/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center ml-4">
            <div className="bg-primary text-white h-8 w-8 rounded-md flex items-center justify-center font-bold mr-2">T</div>
            <h1 className="text-xl font-bold">TrafficO</h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center bg-background/20 border border-border rounded-md w-96">
          <Search size={18} className="ml-3 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search intersections, alerts..."
            className="bg-transparent border-0 outline-none h-9 flex-grow px-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="flex items-center gap-2">
          
          <div className="relative">
            <button 
              className="p-2 rounded-md text-foreground hover:bg-background/20 relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-danger rounded-full w-2 h-2"></span>
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-1 bg-card border border-border rounded-md shadow-lg w-80 max-h-96 overflow-y-auto z-20">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="divide-y divide-border">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className="p-3 hover:bg-background/20 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'critical' ? 'bg-danger' :
                          notification.type === 'warning' ? 'bg-warning' :
                          notification.type === 'success' ? 'bg-accent' :
                          'bg-primary'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Link 
                    href="/alerts"
                    className="block w-full text-sm text-primary hover:text-primary/80"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-background/20"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-medium">Traffic Admin</div>
                <div className="text-xs text-muted-foreground">San Jose DOT</div>
              </div>
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 bg-card border border-border rounded-md shadow-lg w-48 py-1 z-20">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-background/20 flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-background/20 flex items-center gap-2">
                  <Settings size={16} className="text-muted-foreground" />
                  <span>Settings</span>
                </button>
                <hr className="border-border my-1" />
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-background/20 flex items-center gap-2 text-danger">
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
} 