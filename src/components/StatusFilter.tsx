import React from 'react';

interface StatusOption {
  value: string;
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface StatusFilterProps {
  label?: string;
  options: StatusOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  className?: string;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  multiple = true,
  className = '',
}) => {
  const handleToggle = (value: string) => {
    if (multiple) {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    } else {
      onChange(selectedValues.includes(value) ? [] : [value]);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500 focus:ring-blue-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 focus:ring-gray-500'
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFilter;

