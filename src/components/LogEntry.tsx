import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SystemLog } from '../types';
import LogLevelBadge from './LogLevelBadge';

interface LogEntryProps {
  log: SystemLog;
}

const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const navigate = useNavigate();

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
        {formatTimestamp(log.created_at)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <LogLevelBadge level={log.level} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
        {log.module ? log.module.replace('module', 'M') : '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {log.job_id ? (
          <button
            onClick={() => navigate(`/jobs/${log.job_id}`)}
            className="text-xs text-blue-600 hover:text-blue-800 underline font-mono"
          >
            {log.job_id}
          </button>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-900">
        {log.message}
      </td>
    </tr>
  );
};

export default LogEntry;

