import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import Table from './Table';
import { JobStatusBadge } from './Badge';
import JobProgressBar from './JobProgressBar';
import EmptyState from './EmptyState';

interface ClientJobsListProps {
  jobs: Job[];
  loading?: boolean;
}

const ClientJobsList: React.FC<ClientJobsListProps> = ({ jobs, loading = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'id',
      label: 'JOB ID',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (job: Job) => (
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="text-blue-600 hover:text-blue-800 underline text-sm font-mono"
        >
          {job.id}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: false,
      defaultWidth: 120,
      minWidth: 100,
      render: (job: Job) => <JobStatusBadge status={job.status} />,
    },
    {
      key: 'module',
      label: 'MODULE',
      sortable: false,
      defaultWidth: 100,
      minWidth: 80,
      render: (job: Job) => (
        <span className="text-gray-600 text-sm">
          {job.current_module ? job.current_module.replace('module', 'M') : '-'}
        </span>
      ),
    },
    {
      key: 'progress',
      label: 'PROGRESS',
      sortable: false,
      defaultWidth: 200,
      minWidth: 150,
      render: (job: Job) => (
        <JobProgressBar
          progress={job.progress}
          currentModule={job.current_module}
          showLabel={false}
        />
      ),
    },
    {
      key: 'created_at',
      label: 'CREATED',
      sortable: false,
      defaultWidth: 180,
      minWidth: 150,
      render: (job: Job) => (
        <span className="text-gray-600 text-sm whitespace-nowrap">
          {formatDate(job.created_at)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">Loading jobs...</div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        description="This client has no jobs yet"
      />
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={jobs}
          onRowClick={(job) => navigate(`/jobs/${job.id}`)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ClientJobsList;

