'use client';

import { useState } from 'react';
import { Search, Bell, Menu, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 h-16 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md hover:bg-slate-700 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center ml-4">
            <div className="bg-blue-500 text-white h-8 w-8 rounded-md flex items-center justify-center font-bold mr-2">T</div>
            <h1 className="text-xl font-bold">TrafficO</h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center bg-slate-700/50 border border-slate-600 rounded-md w-96">
          <Search size={18} className="ml-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search intersections, alerts..."
            className="bg-transparent border-0 outline-none h-9 flex-grow px-3 text-sm text-white placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-md text-slate-300 hover:bg-slate-700"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="p-2 rounded-md text-slate-300 hover:bg-slate-700 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-medium">Traffic Admin</div>
                <div className="text-xs text-slate-400">San Jose DOT</div>
              </div>
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg w-48 py-1 z-20">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 flex items-center gap-2">
                  <Settings size={16} className="text-slate-400" />
                  <span>Settings</span>
                </button>
                <hr className="border-slate-700 my-1" />
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 flex items-center gap-2 text-red-400">
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