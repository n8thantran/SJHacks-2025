'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Settings, User, Lock, Globe, Bell, Database, Save } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  
  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      systemName: 'TrafficO Management System',
      language: 'en-US',
      timeZone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      autoRefresh: true,
      refreshInterval: 30
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      alertSounds: true,
      criticalOnly: false,
      dailyDigest: true
    },
    account: {
      name: 'Admin User',
      email: 'admin@traffico.city',
      role: 'Administrator',
      department: 'Traffic Management'
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      ipRestrictions: false
    },
    database: {
      backupFrequency: 'daily',
      dataRetention: '365',
      autoCleanup: true,
      compressionLevel: 'medium'
    }
  });
  
  const handleInputChange = (section: string, field: string, value: string | number | boolean) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send settings to the server
    console.log('Saving settings:', settings);
    // Show success message or notification
  };
  
  // Tab content components
  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">System Name</label>
          <input
            type="text"
            value={settings.general.systemName}
            onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => handleInputChange('general', 'language', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en-US">English (US)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Time Zone</label>
          <select
            value={settings.general.timeZone}
            onChange={(e) => handleInputChange('general', 'timeZone', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/Los_Angeles">Pacific Time (US)</option>
            <option value="America/Denver">Mountain Time (US)</option>
            <option value="America/Chicago">Central Time (US)</option>
            <option value="America/New_York">Eastern Time (US)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Date Format</label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoRefresh"
          checked={settings.general.autoRefresh}
          onChange={(e) => handleInputChange('general', 'autoRefresh', e.target.checked)}
          className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
        />
        <label htmlFor="autoRefresh" className="text-sm">Enable auto refresh</label>
      </div>
      
      {settings.general.autoRefresh && (
        <div>
          <label className="block text-sm font-medium mb-1">Refresh Interval (seconds)</label>
          <input
            type="number"
            min="5"
            max="300"
            value={settings.general.refreshInterval}
            onChange={(e) => handleInputChange('general', 'refreshInterval', parseInt(e.target.value))}
            className="w-32 p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
  
  const renderNotificationsSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailAlerts"
            checked={settings.notifications.emailAlerts}
            onChange={(e) => handleInputChange('notifications', 'emailAlerts', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="emailAlerts" className="text-sm">Email Alerts</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="smsAlerts"
            checked={settings.notifications.smsAlerts}
            onChange={(e) => handleInputChange('notifications', 'smsAlerts', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="smsAlerts" className="text-sm">SMS Alerts</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="pushNotifications"
            checked={settings.notifications.pushNotifications}
            onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="pushNotifications" className="text-sm">Push Notifications</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="alertSounds"
            checked={settings.notifications.alertSounds}
            onChange={(e) => handleInputChange('notifications', 'alertSounds', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="alertSounds" className="text-sm">Alert Sounds</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="criticalOnly"
            checked={settings.notifications.criticalOnly}
            onChange={(e) => handleInputChange('notifications', 'criticalOnly', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="criticalOnly" className="text-sm">Critical Alerts Only</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dailyDigest"
            checked={settings.notifications.dailyDigest}
            onChange={(e) => handleInputChange('notifications', 'dailyDigest', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="dailyDigest" className="text-sm">Daily Digest</label>
        </div>
      </div>
    </div>
  );
  
  const renderAccountSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={settings.account.name}
            onChange={(e) => handleInputChange('account', 'name', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={settings.account.email}
            onChange={(e) => handleInputChange('account', 'email', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={settings.account.role}
            onChange={(e) => handleInputChange('account', 'role', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option value="Administrator">Administrator</option>
            <option value="Operator">Operator</option>
            <option value="Technician">Technician</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">Contact system administrator to change roles</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input
            type="text"
            value={settings.account.department}
            onChange={(e) => handleInputChange('account', 'department', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Change Password
        </button>
      </div>
    </div>
  );
  
  const renderSecuritySettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="twoFactorAuth" className="text-sm">Two-Factor Authentication</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ipRestrictions"
            checked={settings.security.ipRestrictions}
            onChange={(e) => handleInputChange('security', 'ipRestrictions', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="ipRestrictions" className="text-sm">IP Restrictions</label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-32 p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password Expiry (days)</label>
          <input
            type="number"
            min="30"
            max="365"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value))}
            className="w-32 p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
  
  const renderDatabaseSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Backup Frequency</label>
          <select
            value={settings.database.backupFrequency}
            onChange={(e) => handleInputChange('database', 'backupFrequency', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Data Retention (days)</label>
          <input
            type="number"
            min="30"
            max="3650"
            value={settings.database.dataRetention}
            onChange={(e) => handleInputChange('database', 'dataRetention', e.target.value)}
            className="w-32 p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoCleanup"
            checked={settings.database.autoCleanup}
            onChange={(e) => handleInputChange('database', 'autoCleanup', e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="autoCleanup" className="text-sm">Automatic Data Cleanup</label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Compression Level</label>
          <select
            value={settings.database.compressionLevel}
            onChange={(e) => handleInputChange('database', 'compressionLevel', e.target.value)}
            className="w-full p-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Run Backup Now
        </button>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
          Restore from Backup
        </button>
      </div>
    </div>
  );
  
  // Main render
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Settings className="mr-2" size={24} />
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="bg-slate-800 rounded-lg p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  className={`w-full flex items-center p-2 rounded ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveTab('general')}
                >
                  <Globe size={16} className="mr-2" />
                  General
                </button>
              </li>
              <li>
                <button 
                  className={`w-full flex items-center p-2 rounded ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell size={16} className="mr-2" />
                  Notifications
                </button>
              </li>
              <li>
                <button 
                  className={`w-full flex items-center p-2 rounded ${activeTab === 'account' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveTab('account')}
                >
                  <User size={16} className="mr-2" />
                  Account
                </button>
              </li>
              <li>
                <button 
                  className={`w-full flex items-center p-2 rounded ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Lock size={16} className="mr-2" />
                  Security
                </button>
              </li>
              <li>
                <button 
                  className={`w-full flex items-center p-2 rounded ${activeTab === 'database' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveTab('database')}
                >
                  <Database size={16} className="mr-2" />
                  Database
                </button>
              </li>
            </ul>
          </div>
          
          {/* Settings content */}
          <div className="md:col-span-3 bg-slate-800 rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-medium mb-4">
                {activeTab === 'general' && 'General Settings'}
                {activeTab === 'notifications' && 'Notification Settings'}
                {activeTab === 'account' && 'Account Settings'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'database' && 'Database Settings'}
              </h2>
              
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'notifications' && renderNotificationsSettings()}
              {activeTab === 'account' && renderAccountSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'database' && renderDatabaseSettings()}
              
              <div className="mt-6 pt-4 border-t border-slate-700">
                <button 
                  type="submit" 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 