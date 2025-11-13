import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { getMockGPUResources, getMockJobs } from '../services/mockData';
import { gpuApi, jobsApi } from '../services/api';
import type { GPUResource, Job } from '../types';
import GPUCard from '../components/GPUCard';
import JobQueue from '../components/JobQueue';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Button from '../components/Button';

const GPU = () => {
  const [gpus, setGpus] = useState<GPUResource[]>([]);
  const [queueJobs, setQueueJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);

      let gpusData: GPUResource[] = [];
      let jobsData: Job[] = [];

      if (API_CONFIG.useMockData) {
        [gpusData, jobsData] = await Promise.all([
          getMockGPUResources(),
          getMockJobs({ status: 'queued' }),
        ]);
      } else {
        const [gpusRes, queueRes] = await Promise.all([
          gpuApi.getAll(),
          gpuApi.getQueue(),
        ]);
        gpusData = gpusRes.data;
        jobsData = queueRes.data;
      }

      setGpus(gpusData);
      setQueueJobs(jobsData);
    } catch (err) {
      console.error('Error fetching GPU data:', err);
      setError('Failed to load GPU resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePriorityChange = async (jobId: string, priority: number) => {
    try {
      if (API_CONFIG.useMockData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Update priority in job metadata
        setQueueJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId
              ? {
                  ...job,
                  metadata: {
                    ...(job.metadata as Record<string, unknown> || {}),
                    priority,
                  },
                }
              : job
          )
        );
      } else {
        await gpuApi.updatePriority(jobId, priority);
        // Refresh queue
        const queueRes = await gpuApi.getQueue();
        setQueueJobs(queueRes.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update priority';
      throw new Error(errorMessage);
    }
  };

  // Get job start times for GPUs in use
  const getJobStartTimes = async (): Promise<Record<string, string>> => {
    const startTimes: Record<string, string> = {};
    
    for (const gpu of gpus) {
      if (gpu.status === 'in_use' && gpu.current_job_id) {
        try {
          if (API_CONFIG.useMockData) {
            const allJobs = await getMockJobs();
            const job = allJobs.find(j => j.id === gpu.current_job_id);
            if (job?.started_at) {
              startTimes[gpu.id] = job.started_at;
            }
          } else {
            const jobRes = await jobsApi.getById(gpu.current_job_id);
            if (jobRes.data.started_at) {
              startTimes[gpu.id] = jobRes.data.started_at;
            }
          }
        } catch {
          // Ignore errors
        }
      }
    }
    
    return startTimes;
  };

  const [jobStartTimes, setJobStartTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (gpus.length > 0) {
      getJobStartTimes().then(setJobStartTimes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpus]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading GPU resources..." />;
  }

  if (error) {
    return (
      <div>
        <Alert variant="error" title="Error" onClose={() => setError(null)}>
          {error}
        </Alert>
        <div className="mt-4">
          <Button variant="primary" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const availableCount = gpus.filter(g => g.status === 'available').length;
  const inUseCount = gpus.filter(g => g.status === 'in_use').length;
  const maintenanceCount = gpus.filter(g => g.status === 'maintenance').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">GPU Resources</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor and manage GPU resources and job queue</p>
        </div>
        <div className="flex items-center space-x-3">
          {API_CONFIG.useMockData && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
              Development Mode
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Available
          </div>
          <div className="text-2xl font-semibold text-gray-900">{availableCount}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            In Use
          </div>
          <div className="text-2xl font-semibold text-gray-900">{inUseCount}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Maintenance
          </div>
          <div className="text-2xl font-semibold text-gray-900">{maintenanceCount}</div>
        </div>
      </div>

      {/* GPU Cards */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">GPU Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gpus.map((gpu) => (
            <GPUCard
              key={gpu.id}
              gpu={gpu}
              currentJobStartTime={jobStartTimes[gpu.id]}
            />
          ))}
        </div>
      </div>

      {/* Job Queue */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Job Queue ({queueJobs.length})
        </h2>
        <JobQueue
          jobs={queueJobs}
          onPriorityChange={handlePriorityChange}
          loading={false}
        />
      </div>
    </div>
  );
};

export default GPU;

