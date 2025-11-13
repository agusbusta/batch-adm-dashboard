import React, { useState } from 'react';
import type { SystemLog } from '../types';
import Badge from './Badge';
import Select from './Select';

interface JobLogsViewerProps {
  logs: SystemLog[];
}

const JobLogsViewer: React.FC<JobLogsViewerProps> = ({ logs }) => {
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => 
    levelFilter === 'all' || log.level === levelFilter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLevelVariant = (level: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const levelMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      debug: 'default',
    };
    return levelMap[level] || 'default';
  };

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'debug', label: 'Debug' },
  ];

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No logs available for this job
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Select
          label="Filter by Level"
          options={levelOptions}
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={getLevelVariant(log.level)} size="sm">
                      {log.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {log.module ? log.module.replace('module', 'M') : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No logs match the selected filter
          </div>
        )}
      </div>
    </div>
  );
};

export default JobLogsViewer;

