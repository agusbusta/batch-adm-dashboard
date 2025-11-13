import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getMockJobs } from '../services/mockData';
import { jobsApi } from '../services/api';
import type { Job } from '../types';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import Select from '../components/Select';
import { JobStatusBadge } from '../components/Badge';
import JobProgressBar from '../components/JobProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let jobsData: Job[] = [];
        
        if (API_CONFIG.useMockData) {
          // Retry logic for mock data (more tolerant in development)
          let retries = 3;
          while (retries > 0) {
            try {
              jobsData = await getMockJobs({
                status: statusFilter !== 'all' ? statusFilter : undefined,
              });
              break; // Success, exit retry loop
            } catch {
              retries--;
              if (retries === 0) {
                // Last retry failed, use empty array instead of showing error
                console.warn('Mock data fetch failed after retries, using empty array');
                jobsData = [];
              } else {
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 200));
              }
            }
          }
        } else {
          const response = await jobsApi.getAll({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            client_id: clientFilter !== 'all' ? clientFilter : undefined,
          });
          jobsData = response.data;
        }
        
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [statusFilter, clientFilter]);

  // Apply search and sorting
  useEffect(() => {
    let filtered = [...jobs];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.id.toLowerCase().includes(query) ||
          job.client_id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date | undefined = (a as unknown as Record<string, unknown>)[sortKey] as string | number | Date | undefined;
      let bValue: string | number | Date | undefined = (b as unknown as Record<string, unknown>)[sortKey] as string | number | Date | undefined;

      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [jobs, searchQuery, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleRowClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'id',
      label: 'Job ID',
      sortable: true,
      defaultWidth: 220,
      minWidth: 150,
      render: (job: Job) => (
        <span className="font-mono text-xs text-blue-600">{job.id}</span>
      ),
    },
    {
      key: 'client_id',
      label: 'Client',
      sortable: true,
      defaultWidth: 220,
      minWidth: 150,
      render: (job: Job) => (
        <span className="text-gray-900">{job.client_id}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      defaultWidth: 140,
      minWidth: 110,
      render: (job: Job) => <JobStatusBadge status={job.status} />,
    },
    {
      key: 'current_module',
      label: 'Module',
      defaultWidth: 110,
      minWidth: 90,
      render: (job: Job) => (
        <span className="text-gray-600">
          {job.current_module ? job.current_module.replace('module', 'M') : '-'}
        </span>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      defaultWidth: 200,
      minWidth: 170,
      render: (job: Job) => (
        <div className="w-full">
          <JobProgressBar progress={job.progress} currentModule={job.current_module} showLabel={false} />
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      defaultWidth: 220,
      minWidth: 180,
      render: (job: Job) => (
        <span className="text-gray-600 whitespace-nowrap">{formatDate(job.created_at)}</span>
      ),
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'queued', label: 'Queued' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading jobs..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4">
        <h3 className="text-sm font-medium text-red-800">Error loading jobs</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage video processing jobs</p>
          </div>
          {API_CONFIG.useMockData && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
              Development Mode
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchBar
              placeholder="Search by Job ID or Client ID..."
              onSearch={setSearchQuery}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setClientFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <div className="bg-white rounded border border-gray-200 overflow-hidden w-full">
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedJobs}
                onRowClick={handleRowClick}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                className="w-full"
              />
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredJobs.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;

