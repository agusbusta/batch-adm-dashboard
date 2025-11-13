import React, { useState } from 'react';
import Button from './Button';

interface JSONViewerProps {
  data: Record<string, any>;
  title?: string;
  defaultExpanded?: boolean;
}

const JSONViewer: React.FC<JSONViewerProps> = ({
  data,
  title = 'Metadata',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const formatJSON = (obj: Record<string, any>): string => {
    return JSON.stringify(obj, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatJSON(data));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <pre className="text-xs font-mono text-gray-800 overflow-x-auto">
            {formatJSON(data)}
          </pre>
        </div>
      )}
      
      {!isExpanded && (
        <div className="p-4">
          <p className="text-sm text-gray-500">
            {Object.keys(data).length} properties
          </p>
        </div>
      )}
    </div>
  );
};

export default JSONViewer;

