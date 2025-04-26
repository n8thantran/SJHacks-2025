'use client';

import { useState } from 'react';
import { AlertCircle, Bell, AlertTriangle } from 'lucide-react';

// Mock alert data
const mockAlerts = [
  {
    id: 1,
    type: 'emergency',
    message: 'Ambulance detected at 4th & San Fernando',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 2,
    type: 'congestion',
    message: 'Heavy congestion at Market & San Carlos',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 3,
    type: 'system',
    message: 'Signal optimization applied to downtown corridor',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 4,
    type: 'emergency',
    message: 'Fire truck en route to Santa Clara Ave',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
  }
];

export default function AlertPanel() {
  const [alerts, setAlerts] = useState(mockAlerts);
  
  // Format the timestamp relative to current time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleString();
  };
  
  // Mark an alert as read
  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };
  
  // Get the appropriate icon based on alert type
  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'emergency':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'congestion':
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return <Bell className="text-blue-500" size={20} />;
    }
  };
  
  // Count unread alerts
  const unreadCount = alerts.filter(alert => !alert.read).length;
  
  return (
    <div className="bg-slate-800 p-4 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell size={18} />
          Alerts
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {alerts.length === 0 ? (
          <div className="text-slate-400 text-center py-4">No alerts</div>
        ) : (
          <ul className="space-y-2">
            {alerts.map(alert => (
              <li 
                key={alert.id}
                className={`p-3 rounded-md ${
                  alert.read ? 'bg-slate-700/50' : 'bg-slate-700'
                } ${
                  alert.type === 'emergency' && !alert.read ? 'border-l-4 border-red-500' : ''
                }`}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-grow">
                    <p className={`${alert.read ? 'text-slate-300' : 'text-white font-medium'}`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 