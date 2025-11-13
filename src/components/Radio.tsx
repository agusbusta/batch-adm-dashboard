import React from 'react';

interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  options: RadioOption[];
  error?: string;
  helperText?: string;
}

const Radio: React.FC<RadioProps> = ({
  label,
  options,
  error,
  helperText,
  name,
  className = '',
  id,
  ...props
}) => {
  const radioGroupId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  const radioName = name || radioGroupId;
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const optionId = `${radioGroupId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center">
              <input
                id={optionId}
                type="radio"
                name={radioName}
                value={option.value}
                disabled={option.disabled || props.disabled}
                className={`
                  h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300
                  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
                  ${hasError ? 'border-red-300' : ''}
                  ${className}
                `}
                {...props}
              />
              <label
                htmlFor={optionId}
                className={`ml-2 block text-sm text-gray-900 ${
                  option.disabled || props.disabled ? 'text-gray-400' : ''
                }`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Radio;

