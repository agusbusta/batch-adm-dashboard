import React from 'react';
import Badge from './Badge';

interface LogLevelBadgeProps {
  level: 'info' | 'warning' | 'error' | 'debug';
}

const LogLevelBadge: React.FC<LogLevelBadgeProps> = ({ level }) => {
  const levelConfig = {
    info: { variant: 'info' as const, label: 'INFO' },
    warning: { variant: 'warning' as const, label: 'WARN' },
    error: { variant: 'error' as const, label: 'ERROR' },
    debug: { variant: 'default' as const, label: 'DEBUG' },
  };

  const config = levelConfig[level];

  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
};

export default LogLevelBadge;

