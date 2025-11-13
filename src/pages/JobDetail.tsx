import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getMockJobById, generateMockJobStatusHistory } from '../services/mockData';
import { getMockLogs } from '../services/mockData';
import { jobsApi } from '../services/api';
import type { Job, JobStatusHistory, SystemLog } from '../types';
import { JobStatusBadge } from '../components/Badge';
import JobProgressBar from '../components/JobProgressBar';
import JobTimeline from '../components/JobTimeline';
import ModuleProgress from '../components/ModuleProgress';
import JobLogsViewer from '../components/JobLogsViewer';
import JSONViewer from '../components/JSONViewer';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Button from '../components/Button';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [statusHistory, setStatusHistory] = useState<JobStatusHistory[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        let jobData: Job | null = null;
        let logsData: SystemLog[] = [];
        let historyData: JobStatusHistory[] = [];

        if (API_CONFIG.useMockData) {
          [jobData, logsData] = await Promise.all([
            getMockJobById(id),
            getMockLogs({ job_id: id }),
          ]);
          historyData = generateMockJobStatusHistory(id);
        } else {
          const [jobRes, logsRes, historyRes] = await Promise.all([
            jobsApi.getById(id),
            jobsApi.getLogs(id),
            jobsApi.getStatusHistory(id),
          ]);
          jobData = jobRes.data;
          logsData = logsRes.data;
          historyData = historyRes.data;
        }

        if (!jobData) {
          setError('Job not found');
          return;
        }

        setJob(jobData);
        setLogs(logsData);
        setStatusHistory(historyData);
      } catch (err) {
        console.error('Error fetching job data:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModuleStatus = (module: 'module1' | 'module2' | 'module3'): {
    status: 'pending' | 'completed' | 'processing' | 'failed' | 'not_started';
    progress: number;
    startedAt?: string;
    completedAt?: string;
  } => {
    if (!job) {
      return { status: 'not_started', progress: 0 };
    }

    const currentModule = job.current_module;
    const jobStatus = job.status;

    if (module === 'module1') {
      if (currentModule === 'module1' && jobStatus === 'processing') {
        return { status: 'processing', progress: job.progress, startedAt: job.started_at };
      }
      if (currentModule && ['module2', 'module3'].includes(currentModule)) {
        return { status: 'completed', progress: 100, startedAt: job.started_at, completedAt: job.started_at };
      }
      if (jobStatus === 'completed') {
        return { status: 'completed', progress: 100, startedAt: job.started_at, completedAt: job.completed_at };
      }
      if (jobStatus === 'failed') {
        return { status: 'failed', progress: job.progress, startedAt: job.started_at };
      }
      return { status: 'pending', progress: 0 };
    }

    if (module === 'module2') {
      if (currentModule === 'module2' && jobStatus === 'processing') {
        return { status: 'processing', progress: job.progress, startedAt: job.started_at };
      }
      if (currentModule === 'module3') {
        return { status: 'completed', progress: 100, startedAt: job.started_at, completedAt: job.started_at };
      }
      if (jobStatus === 'completed') {
        return { status: 'completed', progress: 100, startedAt: job.started_at, completedAt: job.completed_at };
      }
      if (jobStatus === 'failed' && currentModule === 'module2') {
        return { status: 'failed', progress: job.progress, startedAt: job.started_at };
      }
      if (!currentModule || currentModule === 'module1') {
        return { status: 'not_started', progress: 0 };
      }
      return { status: 'pending', progress: 0 };
    }

    if (module === 'module3') {
      if (currentModule === 'module3' && jobStatus === 'processing') {
        return { status: 'processing', progress: job.progress, startedAt: job.started_at };
      }
      if (jobStatus === 'completed') {
        return { status: 'completed', progress: 100, startedAt: job.started_at, completedAt: job.completed_at };
      }
      if (jobStatus === 'failed' && currentModule === 'module3') {
        return { status: 'failed', progress: job.progress, startedAt: job.started_at };
      }
      if (!currentModule || ['module1', 'module2'].includes(currentModule)) {
        return { status: 'not_started', progress: 0 };
      }
      return { status: 'pending', progress: 0 };
    }

    return { status: 'not_started', progress: 0 };
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <div>
        <Alert variant="error" title="Error" onClose={() => navigate('/jobs')}>
          {error || 'Job not found'}
        </Alert>
        <div className="mt-4">
          <Button variant="primary" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const module1Status = getModuleStatus('module1');
  const module2Status = getModuleStatus('module2');
  const module3Status = getModuleStatus('module3');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
            ← Back to Jobs
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Job Details</h1>
            <p className="text-xs text-gray-500 mt-1">Job ID: {job.id}</p>
          </div>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      {/* General Information */}
      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</label>
            <p className="text-sm text-gray-900 mt-1 font-mono">{job.id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</label>
            <p className="text-sm text-gray-900 mt-1">{job.client_id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
            <div className="mt-1">
              <JobStatusBadge status={job.status} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</label>
            <div className="mt-1">
              <JobProgressBar progress={job.progress} currentModule={job.current_module} showLabel={false} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</label>
            <p className="text-sm text-gray-900 mt-1">{formatDate(job.created_at)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</label>
            <p className="text-sm text-gray-900 mt-1">{formatDate(job.started_at)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</label>
            <p className="text-sm text-gray-900 mt-1">{formatDate(job.completed_at)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Module</label>
            <p className="text-sm text-gray-900 mt-1">
              {job.current_module ? job.current_module.replace('module', 'M') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Modules Progress */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Module Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModuleProgress
            module="module1"
            status={module1Status.status}
            progress={module1Status.progress}
            startedAt={module1Status.startedAt}
            completedAt={module1Status.completedAt}
          />
          <ModuleProgress
            module="module2"
            status={module2Status.status}
            progress={module2Status.progress}
            startedAt={module2Status.startedAt}
            completedAt={module2Status.completedAt}
          />
          <ModuleProgress
            module="module3"
            status={module3Status.status}
            progress={module3Status.progress}
            startedAt={module3Status.startedAt}
            completedAt={module3Status.completedAt}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Files Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Files</h2>
          <div className="space-y-4">
            <div className="bg-white rounded border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Input Files</h3>
              {job.input_files ? (
                <div className="space-y-2">
                  {Array.isArray(job.input_files.files) ? (
                    job.input_files.files.map((file: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="font-mono">{file}</span>
                        {job.input_files?.total_size && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({job.input_files.total_size} GB)
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No input files</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No input files available</p>
              )}
            </div>

            {job.output_files && (
              <div className="bg-white rounded border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Output Files</h3>
                <div className="space-y-2">
                  {Array.isArray(job.output_files.files) ? (
                    job.output_files.files.map((file: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="font-mono">{file}</span>
                        {job.output_files?.total_size && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({job.output_files.total_size} GB)
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No output files</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status History */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Status History</h2>
          <div className="bg-white rounded border border-gray-200 p-6">
            <JobTimeline history={statusHistory} />
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Logs</h2>
        <div className="bg-white rounded border border-gray-200 p-6">
          <JobLogsViewer logs={logs} />
        </div>
      </div>

      {/* Metadata Section */}
      {job.metadata && (
        <div className="mb-6">
          <JSONViewer data={job.metadata} title="Metadata" defaultExpanded={false} />
        </div>
      )}
    </div>
  );
};

export default JobDetail;

