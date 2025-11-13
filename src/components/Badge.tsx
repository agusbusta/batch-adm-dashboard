import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

// Badge específico para estados de Jobs
export const JobStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    pending: { variant: 'default', label: 'Pending' },
    queued: { variant: 'warning', label: 'Queued' },
    processing: { variant: 'info', label: 'Processing' },
    completed: { variant: 'success', label: 'Completed' },
    failed: { variant: 'error', label: 'Failed' },
  };

  const config = statusConfig[status] || { variant: 'default' as const, label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default Badge;

