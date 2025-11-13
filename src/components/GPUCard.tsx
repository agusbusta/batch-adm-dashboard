import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { GPUResource } from '../types';
import GPUStatusIndicator from './GPUStatusIndicator';

interface GPUCardProps {
  gpu: GPUResource;
  currentJobStartTime?: string;
}

const GPUCard: React.FC<GPUCardProps> = ({ gpu, currentJobStartTime }) => {
  const navigate = useNavigate();

  const formatUptime = (startTime?: string) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = () => {
    switch (gpu.status) {
      case 'available':
        return 'border-l-green-500';
      case 'in_use':
        return 'border-l-blue-500';
      case 'maintenance':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className={`bg-white rounded border border-gray-200 border-l-4 p-6 hover:border-gray-300 transition-colors ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{gpu.name}</h3>
          <div className="mt-2">
            <GPUStatusIndicator status={gpu.status} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {gpu.status === 'in_use' && gpu.current_job_id && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Job
            </label>
            <div className="mt-1">
              <button
                onClick={() => navigate(`/jobs/${gpu.current_job_id}`)}
                className="text-sm text-blue-600 hover:text-blue-800 underline font-mono"
              >
                {gpu.current_job_id}
              </button>
            </div>
          </div>
        )}

        {gpu.status === 'in_use' && currentJobStartTime && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time in Use
            </label>
            <p className="text-sm text-gray-900 mt-1">{formatUptime(currentJobStartTime)}</p>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Updated
          </label>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(gpu.updated_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GPUCard;

