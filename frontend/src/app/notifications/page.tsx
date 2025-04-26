'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Bell, Check, Trash2, BellOff, Filter, RefreshCw } from 'lucide-react';

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    title: 'Critical: Traffic congestion on Main St',
    description: 'Heavy traffic detected at Main St and 5th Ave intersection. Wait time exceeding 15 minutes.',
    timestamp: '2023-11-10T09:15:00',
    type: 'critical',
    read: false,
  },
  {
    id: 2,
    title: 'Camera #12 offline',
    description: 'Camera at Broadway and 7th has gone offline. Maintenance team has been notified.',
    timestamp: '2023-11-09T16:30:00',
    type: 'warning',
    read: false,
  },
  {
    id: 3,
    title: 'Scheduled maintenance completed',
    description: 'Scheduled maintenance for the traffic signals at Downtown district has been completed successfully.',
    timestamp: '2023-11-08T14:45:00',
    type: 'info',
    read: true,
  },
  {
    id: 4,
    title: 'New traffic pattern implemented',
    description: 'The new traffic pattern for the West End district has been successfully implemented. Monitoring for effectiveness.',
    timestamp: '2023-11-07T11:20:00',
    type: 'success',
    read: true,
  },
  {
    id: 5,
    title: 'System update scheduled',
    description: 'A system update is scheduled for November 15 at 02:00 AM. The system will be down for approximately 30 minutes.',
    timestamp: '2023-11-06T10:00:00',
    type: 'info',
    read: true,
  },
  {
    id: 6,
    title: 'Alert: Accident reported',
    description: 'Accident reported at Highway 101 North, near exit 25. Emergency services dispatched.',
    timestamp: '2023-11-05T17:45:00',
    type: 'critical',
    read: true,
  },
  {
    id: 7,
    title: 'Warning: Severe weather alert',
    description: 'Severe weather warning issued for the city. Expect delays and adjust traffic signal timing accordingly.',
    timestamp: '2023-11-04T08:30:00',
    type: 'warning',
    read: true,
  },
  {
    id: 8,
    title: 'Annual maintenance report available',
    description: 'The annual maintenance report for all traffic systems is now available for review in the reports section.',
    timestamp: '2023-11-03T13:15:00',
    type: 'info',
    read: true,
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Get notification type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-200">Critical</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-900 text-amber-200">Warning</span>;
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-200">Success</span>;
      case 'info':
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-200">Info</span>;
    }
  };
  
  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return `${diffSec} seconds ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minutes ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hours ago`;
    } else {
      return `${diffDay} days ago`;
    }
  };
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };
  
  // Delete notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="mr-2" size={24} />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-600 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={markAllAsRead}
              className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md"
            >
              <Check size={16} className="mr-1" />
              Mark All Read
            </button>
            <button 
              onClick={clearAllNotifications}
              className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md"
            >
              <Trash2 size={16} className="mr-1" />
              Clear All
            </button>
            <button 
              className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md"
            >
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-700">
          <span className="flex items-center pr-2 text-sm text-slate-400">
            <Filter size={16} className="mr-1" /> Filter:
          </span>
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'unread' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'critical' ? 'bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Critical
          </button>
          <button 
            onClick={() => setActiveFilter('warning')}
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Warning
          </button>
          <button 
            onClick={() => setActiveFilter('info')}
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'info' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Info
          </button>
          <button 
            onClick={() => setActiveFilter('success')}
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'success' ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Success
          </button>
        </div>
        
        {/* Notifications list */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <BellOff size={48} className="mb-2" />
              <p className="text-lg">No notifications found</p>
              <p className="text-sm">
                {activeFilter !== 'all' 
                  ? 'Try changing your filter settings' 
                  : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg ${
                  notification.read ? 'bg-slate-800' : 'bg-slate-700 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(notification.type)}
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <h3 className="text-md font-medium mb-1">{notification.title}</h3>
                    <p className="text-sm text-slate-400">{notification.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-slate-400 hover:text-blue-500 rounded"
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 