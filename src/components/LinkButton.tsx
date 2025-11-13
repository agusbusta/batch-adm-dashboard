import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface LinkButtonProps {
  to: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  to,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
}) => {
  return (
    <Link to={to} className={className}>
      <Button variant={variant} size={size} className="w-full">
        {children}
      </Button>
    </Link>
  );
};

export default LinkButton;

