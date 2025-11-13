import React from 'react';
import Button from './Button';

interface Filter {
  key: string;
  label: string;
  value: string | number | string[] | null | undefined;
  component: React.ReactNode;
}

interface FilterBarProps {
  filters: Filter[];
  onClear: () => void;
  showClearButton?: boolean;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onClear,
  showClearButton = true,
  className = '',
}) => {
  const hasActiveFilters = filters.some((filter) => {
    if (Array.isArray(filter.value)) {
      return filter.value.length > 0;
    }
    if (typeof filter.value === 'object' && filter.value !== null) {
      return Object.keys(filter.value).length > 0;
    }
    return filter.value !== '' && filter.value !== null && filter.value !== undefined;
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        {showClearButton && hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map((filter) => (
          <div key={filter.key}>
            {filter.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;

