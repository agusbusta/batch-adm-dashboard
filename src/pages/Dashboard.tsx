import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getMockJobs, getMockClients, getMockGPUResources, generateHistoricalData } from '../services/mockData';
import { jobsApi, clientsApi, gpuApi } from '../services/api';
import type { Job, Client, GPUResource } from '../types';
import StatCard from '../components/StatCard';
import StatCardWithChart from '../components/StatCardWithChart';
import StatCardWithDonut from '../components/StatCardWithDonut';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalClients: 0,
    availableGPUs: 0,
    queuedJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        let jobs: Job[] = [];
        let clients: Client[] = [];
        let gpus: GPUResource[] = [];

        if (API_CONFIG.useMockData) {
          // Use mock data
          [jobs, clients, gpus] = await Promise.all([
            getMockJobs(),
            getMockClients(),
            getMockGPUResources(),
          ]);
        } else {
          // Use real API
          const [jobsRes, clientsRes, gpuRes] = await Promise.all([
            jobsApi.getAll(),
            clientsApi.getAll(),
            gpuApi.getAvailable(),
          ]);
          jobs = jobsRes.data;
          clients = clientsRes.data;
          gpus = gpuRes.data;
        }

        const activeJobs = jobs.filter((j: Job) => j.status === 'processing').length;
        const completedJobs = jobs.filter((j: Job) => j.status === 'completed').length;
        const failedJobs = jobs.filter((j: Job) => j.status === 'failed').length;
        const queuedJobs = jobs.filter((j: Job) => j.status === 'queued').length;
        const availableGPUs = gpus.filter((g: GPUResource) => g.status === 'available').length;

        setStats({
          totalJobs: jobs.length,
          activeJobs,
          completedJobs,
          failedJobs,
          totalClients: clients.length,
          availableGPUs,
          queuedJobs,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <p className="text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate historical data for line charts
  const activeJobsData = generateHistoricalData(stats.activeJobs, 7, 0.25);
  const completedJobsData = generateHistoricalData(stats.completedJobs, 7, 0.3);

  // Generate data for donut charts
  const jobsByStatusData = [
    { name: 'Completed', value: stats.completedJobs, color: '#64748b' },
    { name: 'Failed', value: stats.failedJobs, color: '#64748b' },
    { name: 'Processing', value: stats.activeJobs, color: '#475569' },
    { name: 'Queued', value: stats.queuedJobs, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">System metrics and status at a glance</p>
        </div>
        {API_CONFIG.useMockData && (
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
            Development Mode
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {/* Cards with line charts - tendencias */}
        <StatCardWithChart
          label="Active Jobs"
          value={stats.activeJobs}
          data={activeJobsData}
          color="primary"
        />
        <StatCardWithChart
          label="Completed Jobs"
          value={stats.completedJobs}
          data={completedJobsData}
          color="success"
        />
        
        {/* Cards with donut charts - distribución */}
        <StatCardWithDonut
          label="Jobs by Status"
          value={stats.totalJobs}
          data={jobsByStatusData}
          color="primary"
        />
        
        {/* Simple cards - solo números */}
        <StatCard
          label="Failed Jobs"
          value={stats.failedJobs}
          color="error"
        />
        <StatCard
          label="Queued Jobs"
          value={stats.queuedJobs}
          color="warning"
        />
        <StatCard
          label="Total Clients"
          value={stats.totalClients}
          color="neutral"
        />
        <StatCard
          label="Available GPUs"
          value={stats.availableGPUs}
          color="neutral"
        />
      </div>

      <div className="mt-8 bg-white rounded border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/jobs"
            className="px-5 py-2.5 bg-slate-700 text-white rounded border border-slate-600 hover:bg-slate-800 text-center transition-colors font-medium text-sm"
          >
            View All Jobs
          </Link>
          <Link
            to="/clients"
            className="px-5 py-2.5 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 text-center transition-colors font-medium text-sm"
          >
            Manage Clients
          </Link>
          <Link
            to="/reports"
            className="px-5 py-2.5 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 text-center transition-colors font-medium text-sm"
          >
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

