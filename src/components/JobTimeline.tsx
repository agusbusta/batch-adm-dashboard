import React from 'react';
import type { JobStatusHistory } from '../types';
import Badge from './Badge';

interface JobTimelineProps {
  history: JobStatusHistory[];
}

const JobTimeline: React.FC<JobTimelineProps> = ({ history }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const statusMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'default',
      queued: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
    };
    return statusMap[status.toLowerCase()] || 'default';
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No status history available
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {history.map((item, index) => (
          <div key={item.id} className="relative flex items-start">
            {/* Timeline dot */}
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              index === 0 
                ? 'bg-slate-700 border-slate-700' 
                : 'bg-white border-gray-300'
            }`}>
              {index === 0 && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            
            {/* Content */}
            <div className="ml-4 flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                  {item.module && (
                    <span className="text-xs text-gray-500">
                      {item.module.replace('module', 'M')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(item.created_at)}
                </span>
              </div>
              {item.message && (
                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobTimeline;

