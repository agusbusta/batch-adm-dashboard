import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface StatCardWithChartProps {
  label: string;
  value: string | number;
  data: DataPoint[];
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error';
  showChart?: boolean;
}

const StatCardWithChart: React.FC<StatCardWithChartProps> = ({
  label,
  value,
  data,
  color = 'primary',
  showChart = true,
}) => {
  const colorConfig = {
    primary: { stroke: '#475569', gradient: '#475569' },
    neutral: { stroke: '#94a3b8', gradient: '#94a3b8' },
    success: { stroke: '#64748b', gradient: '#64748b' },
    warning: { stroke: '#94a3b8', gradient: '#94a3b8' },
    error: { stroke: '#64748b', gradient: '#64748b' },
  };

  const currentColor = colorConfig[color];

  const borderClasses = {
    primary: 'border-l-slate-700',
    neutral: 'border-l-slate-400',
    success: 'border-l-slate-600',
    warning: 'border-l-slate-500',
    error: 'border-l-slate-600',
  };

  // Format date for display (show only time or day)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white rounded border border-gray-200 border-l-2 p-5 hover:border-gray-300 transition-colors ${borderClasses[color]}`}>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</h3>
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {showChart && data.length > 0 && (
          <div className="h-20 -mx-1 -mb-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentColor.gradient} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={currentColor.gradient} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  hide
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [value, '']}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={currentColor.stroke}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: currentColor.stroke, strokeWidth: 2, stroke: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCardWithChart;

