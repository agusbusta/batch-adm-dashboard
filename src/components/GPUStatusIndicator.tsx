import React from 'react';
import Badge from './Badge';

interface GPUStatusIndicatorProps {
  status: 'available' | 'in_use' | 'maintenance';
}

const GPUStatusIndicator: React.FC<GPUStatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    available: { variant: 'success' as const, label: 'Available' },
    in_use: { variant: 'info' as const, label: 'In Use' },
    maintenance: { variant: 'warning' as const, label: 'Maintenance' },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default GPUStatusIndicator;

