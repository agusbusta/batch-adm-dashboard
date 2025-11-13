import React from 'react';
import JSONViewer from './JSONViewer';

interface MASVConfigViewerProps {
  config?: Record<string, any>;
}

const MASVConfigViewer: React.FC<MASVConfigViewerProps> = ({ config }) => {
  if (!config || Object.keys(config).length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <p className="text-sm text-gray-500">No MASV portal configuration available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">MASV Portal Configuration</h3>
      <JSONViewer data={config} title="Configuration" defaultExpanded={true} />
    </div>
  );
};

export default MASVConfigViewer;

