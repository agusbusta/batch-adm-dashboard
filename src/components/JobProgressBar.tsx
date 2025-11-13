import React from 'react';

interface JobProgressBarProps {
  progress: number; // 0-100
  currentModule?: string;
  showLabel?: boolean;
}

const JobProgressBar: React.FC<JobProgressBarProps> = ({
  progress,
  currentModule,
  showLabel = true,
}) => {
  const getModuleLabel = (module?: string) => {
    if (!module) return '';
    const labels: Record<string, string> = {
      module1: 'Module 1: RAW → ProRes',
      module2: 'Module 2: ML Processing',
      module3: 'Module 3: Format Conversion',
    };
    return labels[module] || module;
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">
            {currentModule ? getModuleLabel(currentModule) : 'Progress'}
          </span>
          <span className="text-xs font-medium text-gray-700">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default JobProgressBar;

