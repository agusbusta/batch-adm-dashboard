import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { JobStatusBadge } from './Badge';
import EmptyState from './EmptyState';

interface JobQueueProps {
  jobs: Job[];
  onPriorityChange: (jobId: string, priority: number) => Promise<void>;
  loading?: boolean;
}

// Extended Job type with priority for queue
interface QueuedJob extends Job {
  priority?: number;
  queuedAt?: string;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, onPriorityChange, loading = false }) => {
  const navigate = useNavigate();
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Add priority to jobs (simulated - in real app this would come from API)
  const queuedJobs: QueuedJob[] = jobs.map((job, index) => ({
    ...job,
    priority: (job.metadata as Record<string, unknown>)?.priority as number | undefined || 100 - index, // Default priority
    queuedAt: job.created_at,
  }));

  // Sort by priority (higher priority = lower number)
  const [sortedJobs, setSortedJobs] = useState<QueuedJob[]>(() => 
    [...queuedJobs].sort((a, b) => (a.priority || 100) - (b.priority || 100))
  );

  // Update sorted jobs when queuedJobs change
  React.useEffect(() => {
    setSortedJobs([...queuedJobs].sort((a, b) => (a.priority || 100) - (b.priority || 100)));
  }, [queuedJobs]);

  const formatQueueTime = (queuedAt: string) => {
    const queued = new Date(queuedAt);
    const now = new Date();
    const diff = now.getTime() - queued.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const estimateWaitTime = (index: number) => {
    // Simple estimation: assume 30 minutes per job on average
    const estimatedMinutes = index * 30;
    if (estimatedMinutes < 60) {
      return `~${estimatedMinutes}m`;
    }
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return `~${hours}h ${minutes}m`;
  };

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.stopPropagation();
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', jobId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedJobId) return;

    const draggedIndex = sortedJobs.findIndex(j => j.id === draggedJobId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedJobId(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder jobs
    const newJobs = [...sortedJobs];
    const [draggedJob] = newJobs.splice(draggedIndex, 1);
    newJobs.splice(dropIndex, 0, draggedJob);

    // Calculate priority range based on existing priorities
    const existingPriorities = sortedJobs.map(j => j.priority || 100).filter(p => p > 0);
    const minPriority = existingPriorities.length > 0 ? Math.min(...existingPriorities) : 90;
    const maxPriority = existingPriorities.length > 0 ? Math.max(...existingPriorities) : 100;
    const priorityRange = maxPriority - minPriority;
    const step = priorityRange > 0 ? priorityRange / Math.max(newJobs.length - 1, 1) : 1;

    // Update priorities based on new order, maintaining the original range
    const updatedJobs = newJobs.map((job, index) => ({
      ...job,
      priority: Math.round(minPriority + (index * step)),
    }));

    setSortedJobs(updatedJobs);
    setDraggedJobId(null);
    setDragOverIndex(null);

    // Update priorities via API
    try {
      await Promise.all(
        updatedJobs.map((job) => 
          onPriorityChange(job.id, job.priority!)
        )
      );
    } catch (error) {
      console.error('Failed to update priorities:', error);
      // Revert on error
      setSortedJobs([...queuedJobs].sort((a, b) => (a.priority || 100) - (b.priority || 100)));
    }
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
    setDragOverIndex(null);
  };

  const columns = [
    {
      key: 'priority',
      label: 'PRIORITY',
      sortable: false,
      defaultWidth: 120,
      minWidth: 100,
      render: (job: QueuedJob, index: number) => (
        <div className="flex items-center space-x-2">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, job.id)}
            onDragEnd={handleDragEnd}
            className="cursor-move p-1 hover:bg-gray-100 rounded"
            title="Drag to reorder"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">{job.priority || index + 1}</span>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'JOB ID',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (job: QueuedJob) => (
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="text-blue-600 hover:text-blue-800 underline text-sm font-mono"
        >
          {job.id}
        </button>
      ),
    },
    {
      key: 'client_id',
      label: 'CLIENT',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (job: QueuedJob) => (
        <span className="text-gray-600 text-sm">{job.client_id}</span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: false,
      defaultWidth: 120,
      minWidth: 100,
      render: (job: QueuedJob) => <JobStatusBadge status={job.status} />,
    },
    {
      key: 'queuedAt',
      label: 'QUEUED TIME',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (job: QueuedJob) => (
        <span className="text-gray-600 text-sm">
          {job.queuedAt ? formatQueueTime(job.queuedAt) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'estimate',
      label: 'EST. WAIT',
      sortable: false,
      defaultWidth: 120,
      minWidth: 100,
      render: (job: QueuedJob) => {
        const index = sortedJobs.findIndex(j => j.id === job.id);
        return (
          <span className="text-gray-600 text-sm">
            {estimateWaitTime(index)}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">Loading queue...</div>
    );
  }

  if (sortedJobs.length === 0) {
    return (
      <EmptyState
        title="No jobs in queue"
        description="All jobs are currently being processed or completed"
      />
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job, index) => {
              const isDragging = draggedJobId === job.id;
              const isDragOver = dragOverIndex === index;
              
              return (
                <tr
                  key={job.id}
                  draggable={false}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className={`
                    border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors
                    ${isDragging ? 'opacity-50' : ''}
                    ${isDragOver ? 'bg-blue-50 border-blue-300 border-t-2' : ''}
                  `}
                >
                  {columns.map((col) => {
                    let content: React.ReactNode;
                    if (col.render) {
                      // Type assertion for render function that may accept index
                      const renderFn = col.render as (job: QueuedJob, index?: number) => React.ReactNode;
                      content = renderFn(job, index);
                    } else {
                      content = (job as unknown as Record<string, unknown>)[col.key] as React.ReactNode;
                    }
                    
                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm"
                        onClick={(e) => {
                          // Prevent navigation when clicking on drag handle
                          if (col.key === 'priority') {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobQueue;

