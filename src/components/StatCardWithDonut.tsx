import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface StatCardWithDonutProps {
  label: string;
  value: string | number;
  data: DonutData[];
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error';
}

const StatCardWithDonut: React.FC<StatCardWithDonutProps> = ({
  label,
  value,
  data,
  color = 'primary',
}) => {
  const borderClasses = {
    primary: 'border-l-slate-700',
    neutral: 'border-l-slate-400',
    success: 'border-l-slate-600',
    warning: 'border-l-slate-500',
    error: 'border-l-slate-600',
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`bg-white rounded border border-gray-200 border-l-2 p-5 hover:border-gray-300 transition-colors ${borderClasses[color]}`}>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</h3>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-3xl font-semibold text-gray-900 mb-3">{value}</p>
            <div className="space-y-1">
              {data.map((item, index) => {
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-24 h-24 ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => {
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return [`${value} (${percentage}%)`, ''];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCardWithDonut;

