import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={`
            h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={`ml-2 block text-sm text-gray-900 ${props.disabled ? 'text-gray-400' : ''}`}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;

