
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RsvpStatus } from '../types';
import { RSVP_STATUS_LABELS } from '../constants';

interface StatusChartProps {
  data: { name: RsvpStatus | 'Pending'; value: number }[];
}

const COLORS: Record<string, string> = {
  [RsvpStatus.CONFIRMED]: '#10B981', // green-500
  [RsvpStatus.DECLINED]: '#EF4444', // red-500
  [RsvpStatus.NEEDS_ATTENTION]: '#F97316', // orange-500
  'Pending': '#6B7280', // gray-500
};

const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  const chartData = data.filter(item => item.value > 0).map(item => ({...item, label: RSVP_STATUS_LABELS[item.name as RsvpStatus] || item.name}));
  return (
    <div className="bg-white p-5 shadow rounded-lg h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">התפלגות תגובות</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="label"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Pending']} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'כמות']} />
          <Legend formatter={(value) => <span className="text-gray-700">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
