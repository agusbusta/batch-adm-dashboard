import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'border-l-slate-700',
    neutral: 'border-l-slate-400',
    success: 'border-l-slate-600',
    warning: 'border-l-slate-500',
    error: 'border-l-slate-600',
  };

  return (
    <div className={`bg-white rounded border border-gray-200 border-l-2 p-5 hover:border-gray-300 transition-colors ${colorClasses[color]}`}>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</h3>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-gray-600' : 'text-gray-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

