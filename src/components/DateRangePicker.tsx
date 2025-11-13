import React from 'react';
import DatePicker from './DatePicker';

interface DateRangePickerProps {
  label?: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string;
  helperText?: string;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
  helperText,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          max={endDate}
          error={error}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate}
          error={error}
        />
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default DateRangePicker;

