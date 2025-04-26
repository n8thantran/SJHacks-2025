'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Car, Timer, Activity, TrendingDown } from 'lucide-react';

// Mock data for traffic statistics
const hourlyTrafficData = [
  { hour: '6AM', count: 120 },
  { hour: '7AM', count: 240 },
  { hour: '8AM', count: 380 },
  { hour: '9AM', count: 320 },
  { hour: '10AM', count: 220 },
  { hour: '11AM', count: 180 },
  { hour: '12PM', count: 190 },
  { hour: '1PM', count: 200 },
  { hour: '2PM', count: 210 },
  { hour: '3PM', count: 270 },
  { hour: '4PM', count: 350 },
  { hour: '5PM', count: 410 },
  { hour: '6PM', count: 350 },
  { hour: '7PM', count: 220 },
];

const waitTimeData = [
  { time: '6AM', wait: 45 },
  { time: '8AM', wait: 85 },
  { time: '10AM', wait: 60 },
  { time: '12PM', wait: 60 },
  { time: '2PM', wait: 55 },
  { time: '4PM', wait: 95 },
  { time: '6PM', wait: 80 },
  { time: '8PM', wait: 50 },
];

// Array of metrics cards
const metricCards = [
  {
    title: 'Total Vehicles',
    value: '3,241',
    change: '+12%',
    trend: 'up',
    icon: <Car size={20} />,
  },
  {
    title: 'Avg. Wait Time',
    value: '64s',
    change: '-18%',
    trend: 'down',
    icon: <Timer size={20} />,
  },
  {
    title: 'Signal Cycles',
    value: '285',
    change: '+8%',
    trend: 'up',
    icon: <Activity size={20} />,
  },
  {
    title: 'Emergency Vehicles',
    value: '6',
    change: '+2',
    trend: 'neutral',
    icon: <TrendingDown size={20} />,
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{value: number; name: string}>;
  label?: string;
  unit?: string;
}

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload, label, unit = '' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 p-2 rounded border border-slate-600 text-xs">
        <p className="text-slate-300">{`${label}`}</p>
        <p className="text-white font-semibold">{`${payload[0].value} ${unit}`}</p>
      </div>
    );
  }
  return null;
};

export default function StatisticsPanel() {
  return (
    <div className="bg-slate-800 p-4 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity size={18} />
        Traffic Statistics
      </h2>
      
      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-slate-700 p-3 rounded-md">
            <div className="flex justify-between">
              <div>
                <p className="text-slate-400 text-xs">{card.title}</p>
                <p className="text-2xl font-semibold">{card.value}</p>
              </div>
              <div className={`h-9 w-9 rounded-md flex items-center justify-center ${
                card.trend === 'up' ? 'bg-emerald-500/20 text-emerald-500' : 
                card.trend === 'down' ? 'bg-blue-500/20 text-blue-500' : 
                'bg-slate-500/20 text-slate-400'
              }`}>
                {card.icon}
              </div>
            </div>
            <div className={`text-xs mt-1 ${
              card.trend === 'up' ? 'text-emerald-500' : 
              card.trend === 'down' ? 'text-blue-500' : 
              'text-slate-400'
            }`}>
              {card.change} from yesterday
            </div>
          </div>
        ))}
      </div>
      
      {/* Traffic volume chart */}
      <div className="flex-grow mb-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Traffic Volume (Today)</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyTrafficData}>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip content={<CustomTooltip unit="vehicles" />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Wait time chart */}
      <div className="flex-grow">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Avg. Wait Time (seconds)</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waitTimeData}>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip content={<CustomTooltip unit="seconds" />} />
              <Line 
                type="monotone" 
                dataKey="wait" 
                stroke="#22c55e" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 