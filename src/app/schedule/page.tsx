'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Calendar, Clock, MapPin, PenToolIcon, Truck, User, List, Grid, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// Enhanced mock schedule data with more details
const mockSchedule = [
  {
    id: 1,
    title: 'Camera Maintenance',
    description: 'Routine maintenance of traffic cameras',
    location: '10th & Santa Clara',
    startTime: new Date(2025, 4, 15, 9, 0),
    endTime: new Date(2025, 4, 15, 11, 0),
    type: 'maintenance',
    status: 'scheduled',
    priority: 'medium',
    technician: 'John Smith'
  },
  {
    id: 2,
    title: 'Traffic Signal Update',
    description: 'Software update for traffic signals',
    location: 'Downtown Corridor',
    startTime: new Date(2025, 4, 18, 2, 0),
    endTime: new Date(2025, 4, 18, 4, 0),
    type: 'update',
    status: 'scheduled',
    priority: 'high',
    technician: 'Maria Rodriguez'
  },
  {
    id: 3,
    title: 'System Backup',
    description: 'Automated backup of all traffic systems',
    location: 'All Intersections',
    startTime: new Date(2025, 4, 20, 1, 0),
    endTime: new Date(2025, 4, 20, 2, 0),
    type: 'system',
    status: 'scheduled',
    priority: 'low',
    technician: 'Automated'
  },
  {
    id: 4,
    title: 'Intersection Audit',
    description: 'Physical audit of intersection equipment',
    location: 'Market & San Carlos',
    startTime: new Date(2025, 4, 22, 10, 0),
    endTime: new Date(2025, 4, 22, 12, 0),
    type: 'audit',
    status: 'scheduled',
    priority: 'medium',
    technician: 'David Chen'
  },
  {
    id: 5,
    title: 'Camera Installation',
    description: 'New traffic camera installation',
    location: 'Almaden & Curtner',
    startTime: new Date(2025, 4, 25, 8, 0),
    endTime: new Date(2025, 4, 25, 12, 0),
    type: 'installation',
    status: 'scheduled',
    priority: 'high',
    technician: 'Sarah Johnson'
  },
  {
    id: 6,
    title: 'Sensor Calibration',
    description: 'Calibrating traffic flow sensors',
    location: 'Stevens Creek Blvd',
    startTime: new Date(2025, 4, 16, 14, 0),
    endTime: new Date(2025, 4, 16, 16, 0),
    type: 'maintenance',
    status: 'scheduled',
    priority: 'medium',
    technician: 'John Smith'
  },
  {
    id: 7,
    title: 'Emergency Repair',
    description: 'Fixing damaged traffic light',
    location: 'Winchester & Stevens Creek',
    startTime: new Date(2025, 4, 12, 7, 0),
    endTime: new Date(2025, 4, 12, 10, 0),
    type: 'maintenance',
    status: 'completed',
    priority: 'critical',
    technician: 'Emergency Team'
  }
];

export default function SchedulePage() {
  // State for current date, events, and view type
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025
  const [events, setEvents] = useState(mockSchedule);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Helper functions for date manipulation
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const selectDay = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(selected);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getEventsForDay = (day: number): typeof mockSchedule => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => isSameDay(event.startTime, dayDate));
  };

  const hasEvents = (day: number): boolean => {
    return getEventsForDay(day).length > 0;
  };

  const getFilteredEvents = (): typeof mockSchedule => {
    let filteredEvents = events;
    
    // Filter by selected day
    if (selectedDay) {
      filteredEvents = filteredEvents.filter(event => isSameDay(event.startTime, selectedDay));
    }
    
    // Filter by type if filter is applied
    if (filterType) {
      filteredEvents = filteredEvents.filter(event => event.type === filterType);
    }
    
    return filteredEvents;
  };
  
  // Helper function to get the correct icon based on task type
  const getTaskIcon = (type: string) => {
    switch(type) {
      case 'maintenance':
        return <PenToolIcon className="text-amber-500" size={18} />;
      case 'update':
        return <Truck className="text-blue-500" size={18} />;
      case 'system':
        return <Clock className="text-purple-500" size={18} />;
      case 'audit':
        return <User className="text-emerald-500" size={18} />;
      case 'installation':
        return <Truck className="text-red-500" size={18} />;
      default:
        return <Calendar className="text-slate-400" size={18} />;
    }
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    const colorClasses = {
      'low': 'bg-slate-600 text-slate-200',
      'medium': 'bg-blue-600 text-blue-100',
      'high': 'bg-amber-600 text-amber-100',
      'critical': 'bg-red-600 text-red-100'
    };
    
    const color = colorClasses[priority as keyof typeof colorClasses] || colorClasses.medium;
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${color}`}>
        {priority}
      </span>
    );
  };

  // Render calendar view
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-24 border border-slate-700 bg-slate-800/50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = selectedDay && day === selectedDay.getDate() && 
                      month === selectedDay.getMonth() && 
                      year === selectedDay.getFullYear();
      
      days.push(
        <div 
          key={`day-${day}`}
          onClick={() => selectDay(day)}
          className={`p-2 h-24 border border-slate-700 hover:bg-slate-700/70 cursor-pointer transition-colors overflow-hidden ${
            isToday ? 'bg-slate-700' : 'bg-slate-800/50'
          }`}
        >
          <div className="flex justify-between">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : ''}`}>
              {day}
            </span>
            {hasEvents(day) && (
              <span className="flex gap-1">
                {dayEvents.slice(0, 3).map(event => (
                  <span key={event.id} className="block w-2 h-2 rounded-full bg-blue-500"></span>
                ))}
                {dayEvents.length > 3 && <span className="text-xs text-slate-400">+{dayEvents.length - 3}</span>}
              </span>
            )}
          </div>
          
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div key={event.id} className="text-xs bg-slate-700 rounded p-1 truncate">
                {formatTime(event.startTime)} - {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-slate-400">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-700 text-center py-2 text-sm font-medium">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  // Render list view
  const renderList = () => {
    const filteredEvents = getFilteredEvents();
    
    return (
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-slate-700 p-3 text-sm font-medium">
          <div>Task</div>
          <div>Location</div>
          <div>Date & Time</div>
          <div>Details</div>
        </div>
        
        <div className="divide-y divide-slate-700">
          {filteredEvents.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              No events found for the selected criteria.
            </div>
          ) : (
            filteredEvents.map(task => (
              <div key={task.id} className="grid grid-cols-4 p-4 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-2">
                  {getTaskIcon(task.type)}
                  <div>
                    <span className="font-medium">{task.title}</span>
                    <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-300">
                  <MapPin size={14} className="mr-1 text-slate-400 flex-shrink-0" />
                  <span>{task.location}</span>
                </div>
                <div className="flex flex-col text-slate-300">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1 text-slate-400 flex-shrink-0" />
                    {formatDate(task.startTime)}
                  </div>
                  <div className="flex items-center text-sm text-slate-400 mt-1">
                    <Clock size={14} className="mr-1 flex-shrink-0" />
                    {formatTime(task.startTime)} - {formatTime(task.endTime)}
                  </div>
                </div>
                <div className="text-slate-300">
                  <div className="flex items-center">
                    <User size={14} className="mr-1 text-slate-400 flex-shrink-0" />
                    {task.technician}
                  </div>
                  <div className="mt-1">
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Maintenance Schedule</h1>
          <div className="flex gap-3">
            <div className="flex border border-slate-700 rounded-md overflow-hidden">
              <button 
                onClick={() => setViewType('calendar')} 
                className={`px-3 py-1.5 flex items-center gap-1 ${
                  viewType === 'calendar' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Grid size={16} />
                <span className="text-sm">Calendar</span>
              </button>
              <button 
                onClick={() => setViewType('list')} 
                className={`px-3 py-1.5 flex items-center gap-1 ${
                  viewType === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <List size={16} />
                <span className="text-sm">List</span>
              </button>
            </div>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1">
              <span className="text-lg leading-none">+</span> Add Task
            </button>
          </div>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          {viewType === 'calendar' && (
            <>
              <div className="flex items-center gap-2">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-1 rounded-full hover:bg-slate-700"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-medium">{getMonthName(currentDate)}</h2>
                <button 
                  onClick={goToNextMonth}
                  className="p-1 rounded-full hover:bg-slate-700"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}
          
          {selectedDay && (
            <div className="text-slate-300">
              {viewType === 'list' ? "Showing events for: " : "Selected: "}
              <span className="font-medium text-white">{formatDate(selectedDay)}</span>
              <button 
                onClick={() => setSelectedDay(null)} 
                className="ml-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Clear
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm"
            >
              <option value="">All Types</option>
              <option value="maintenance">Maintenance</option>
              <option value="update">Update</option>
              <option value="system">System</option>
              <option value="audit">Audit</option>
              <option value="installation">Installation</option>
            </select>
          </div>
        </div>
        
        {viewType === 'calendar' ? renderCalendar() : renderList()}
      </div>
    </DashboardLayout>
  );
}