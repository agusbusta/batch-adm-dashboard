import React from 'react';
import SearchBar from './SearchBar';
import Select from './Select';
import DateRangePicker from './DateRangePicker';
import Input from './Input';
import Button from './Button';

interface LogsFilterBarProps {
  levelFilter: string;
  moduleFilter: string;
  jobIdFilter: string;
  dateRange: { start: string; end: string } | null;
  searchQuery: string;
  onLevelChange: (level: string) => void;
  onModuleChange: (module: string) => void;
  onJobIdChange: (jobId: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

const LogsFilterBar: React.FC<LogsFilterBarProps> = ({
  levelFilter,
  moduleFilter,
  jobIdFilter,
  dateRange,
  searchQuery,
  onLevelChange,
  onModuleChange,
  onJobIdChange,
  onDateRangeChange,
  onSearchChange,
  onClear,
}) => {
  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'debug', label: 'Debug' },
  ];

  const moduleOptions = [
    { value: 'all', label: 'All Modules' },
    { value: 'module1', label: 'Module 1' },
    { value: 'module2', label: 'Module 2' },
    { value: 'module3', label: 'Module 3' },
    { value: 'bam', label: 'BAM' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'masv', label: 'MASV' },
  ];

  const hasActiveFilters =
    levelFilter !== 'all' ||
    moduleFilter !== 'all' ||
    jobIdFilter !== '' ||
    dateRange !== null ||
    searchQuery !== '';

  return (
    <div className="bg-white rounded border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <SearchBar
            placeholder="Search by message..."
            onSearch={onSearchChange}
          />
        </div>
        <Select
          label="Level"
          options={levelOptions}
          value={levelFilter}
          onChange={(e) => onLevelChange(e.target.value)}
        />
        <Select
          label="Module"
          options={moduleOptions}
          value={moduleFilter}
          onChange={(e) => onModuleChange(e.target.value)}
        />
        <Input
          label="Job ID"
          value={jobIdFilter}
          onChange={(e) => onJobIdChange(e.target.value)}
          placeholder="job-xxx"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateRangePicker
          label="Date Range"
          startDate={dateRange?.start}
          endDate={dateRange?.end}
          onStartDateChange={(start: string) =>
            onDateRangeChange(start, dateRange?.end || '')
          }
          onEndDateChange={(end: string) =>
            onDateRangeChange(dateRange?.start || '', end)
          }
        />
        <div className="flex items-end">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsFilterBar;

