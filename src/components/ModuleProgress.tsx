import React from 'react';
import JobProgressBar from './JobProgressBar';
import Badge from './Badge';

interface ModuleProgressProps {
  module: 'module1' | 'module2' | 'module3';
  status: 'pending' | 'completed' | 'processing' | 'failed' | 'not_started';
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

const ModuleProgress: React.FC<ModuleProgressProps> = ({
  module,
  status,
  progress,
  startedAt,
  completedAt,
}) => {
  const moduleLabels = {
    module1: 'Module 1: RAW → ProRes',
    module2: 'Module 2: ML Processing',
    module3: 'Module 3: Format Conversion',
  };

  const getStatusVariant = (): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (status === 'completed') return 'success';
    if (status === 'processing') return 'info';
    if (status === 'failed') return 'error';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">{moduleLabels[module]}</h4>
        <Badge variant={getStatusVariant()}>
          {status === 'not_started' ? 'Not Started' : status}
        </Badge>
      </div>
      
      <div className="mb-3">
        <JobProgressBar
          progress={progress}
          currentModule={status === 'processing' ? module : undefined}
          showLabel={false}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <span className="font-medium">Started:</span> {formatDate(startedAt)}
        </div>
        <div>
          <span className="font-medium">Completed:</span> {formatDate(completedAt)}
        </div>
      </div>
    </div>
  );
};

export default ModuleProgress;

