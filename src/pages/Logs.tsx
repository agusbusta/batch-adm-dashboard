import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { getMockLogs } from '../services/mockData';
import { logsApi } from '../services/api';
import type { SystemLog } from '../types';
import LogEntry from '../components/LogEntry';
import LogsFilterBar from '../components/LogsFilterBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

const Logs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [jobIdFilter, setJobIdFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        let logsData: SystemLog[] = [];

        if (API_CONFIG.useMockData) {
          const allLogs = await getMockLogs({
            level: levelFilter !== 'all' ? levelFilter : undefined,
            job_id: jobIdFilter || undefined,
          });
          // Filter by module if needed
          logsData = moduleFilter !== 'all'
            ? allLogs.filter(log => log.module === moduleFilter)
            : allLogs;
        } else {
          const response = await logsApi.getAll({
            level: levelFilter !== 'all' ? levelFilter : undefined,
            module: moduleFilter !== 'all' ? moduleFilter : undefined,
            start_date: dateRange?.start,
            end_date: dateRange?.end,
          });
          logsData = response.data;
        }

        // Filter by job ID if provided
        if (jobIdFilter) {
          logsData = logsData.filter(log => log.job_id === jobIdFilter);
        }

        // Filter by date range if provided
        if (dateRange) {
          const start = new Date(dateRange.start).getTime();
          const end = new Date(dateRange.end).getTime();
          logsData = logsData.filter(log => {
            const logTime = new Date(log.created_at).getTime();
            return logTime >= start && logTime <= end;
          });
        }

        setLogs(logsData);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [levelFilter, moduleFilter, jobIdFilter, dateRange]);

  // Apply search filter and sort (newest first)
  useEffect(() => {
    let filtered = [...logs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query)
      );
    }

    // Sort by created_at descending (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setLevelFilter('all');
    setModuleFilter('all');
    setJobIdFilter('');
    setDateRange(null);
    setSearchQuery('');
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredLogs.map(log => ({
      timestamp: log.created_at,
      level: log.level,
      module: log.module || '',
      job_id: log.job_id || '',
      message: log.message,
    }));

    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Module', 'Job ID', 'Message'];
      const rows = data.map(row => [
        row.timestamp,
        row.level,
        row.module,
        row.job_id,
        `"${row.message.replace(/"/g, '""')}"`,
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading logs..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading logs</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">System Logs</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor and search system logs</p>
        </div>
        <div className="flex items-center space-x-3">
          {API_CONFIG.useMockData && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
              Development Mode
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('json')}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LogsFilterBar
        levelFilter={levelFilter}
        moduleFilter={moduleFilter}
        jobIdFilter={jobIdFilter}
        dateRange={dateRange}
        searchQuery={searchQuery}
        onLevelChange={setLevelFilter}
        onModuleChange={setModuleFilter}
        onJobIdChange={setJobIdFilter}
        onDateRangeChange={(start, end) => setDateRange(start && end ? { start, end } : null)}
        onSearchChange={setSearchQuery}
        onClear={handleClearFilters}
      />

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No logs found"
          description="Try adjusting your filters or search query"
        />
      ) : (
        <>
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLogs.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredLogs.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Logs;

