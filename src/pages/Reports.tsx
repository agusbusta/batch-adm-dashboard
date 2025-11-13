import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';
import { getMockJobs, getMockClients } from '../services/mockData';
import { jobsApi, clientsApi } from '../services/api';
import type { Job, Client } from '../types';
import StatCard from '../components/StatCard';
import JobsByStatusChart from '../components/JobsByStatusChart';
import JobsByClientChart from '../components/JobsByClientChart';
import TimeSeriesChart from '../components/TimeSeriesChart';
import DateRangePicker from '../components/DateRangePicker';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const Reports = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let jobsData: Job[] = [];
        let clientsData: Client[] = [];

        if (API_CONFIG.useMockData) {
          [jobsData, clientsData] = await Promise.all([
            getMockJobs(),
            getMockClients(),
          ]);
        } else {
          const [jobsRes, clientsRes] = await Promise.all([
            jobsApi.getAll({
              start_date: dateRange?.start,
              end_date: dateRange?.end,
            }),
            clientsApi.getAll(),
          ]);
          jobsData = jobsRes.data;
          clientsData = clientsRes.data;
        }

        // Filter by date range if provided
        if (dateRange) {
          const start = new Date(dateRange.start).getTime();
          const end = new Date(dateRange.end).getTime();
          jobsData = jobsData.filter(job => {
            const jobTime = new Date(job.created_at).getTime();
            return jobTime >= start && jobTime <= end;
          });
        }

        setJobs(jobsData);
        setClients(clientsData);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate metrics
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;
  const processingJobs = jobs.filter(j => j.status === 'processing').length;

  // Calculate average processing time
  const completedJobsWithTimes = jobs.filter(
    j => j.status === 'completed' && j.started_at && j.completed_at
  );
  const avgProcessingTime = completedJobsWithTimes.length > 0
    ? completedJobsWithTimes.reduce((sum, job) => {
        const start = new Date(job.started_at!).getTime();
        const end = new Date(job.completed_at!).getTime();
        return sum + (end - start);
      }, 0) / completedJobsWithTimes.length / (1000 * 60) // Convert to minutes
    : 0;

  const successRate = totalJobs > 0
    ? ((completedJobs / totalJobs) * 100).toFixed(1)
    : '0.0';

  const failureRate = totalJobs > 0
    ? ((failedJobs / totalJobs) * 100).toFixed(1)
    : '0.0';

  // Prepare chart data
  const jobsByStatusData = [
    { name: 'Completed', value: completedJobs, color: '#64748b' },
    { name: 'Failed', value: failedJobs, color: '#ef4444' },
    { name: 'Processing', value: processingJobs, color: '#3b82f6' },
    { name: 'Queued', value: jobs.filter(j => j.status === 'queued').length, color: '#f59e0b' },
    { name: 'Pending', value: jobs.filter(j => j.status === 'pending').length, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  // Jobs by client
  const clientJobCounts: Record<string, number> = {};
  jobs.forEach(job => {
    clientJobCounts[job.client_id] = (clientJobCounts[job.client_id] || 0) + 1;
  });

  const jobsByClientData = Object.entries(clientJobCounts)
    .map(([clientId, count]) => {
      const client = clients.find(c => c.id === clientId);
      return {
        client: client?.name || clientId,
        jobs: count,
      };
    })
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 10); // Top 10 clients

  // Time series data (last 7 days)
  const generateTimeSeriesData = () => {
    const data: Array<{ date: string; completed: number; failed: number; processing: number }> = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayJobs = jobs.filter(job => {
        const jobDate = new Date(job.created_at);
        return jobDate >= date && jobDate < nextDate;
      });
      
      data.push({
        date: date.toISOString(),
        completed: dayJobs.filter(j => j.status === 'completed').length,
        failed: dayJobs.filter(j => j.status === 'failed').length,
        processing: dayJobs.filter(j => j.status === 'processing').length,
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  const handleExport = (format: 'csv' | 'json') => {
    const reportData = {
      period: dateRange
        ? `${dateRange.start} to ${dateRange.end}`
        : 'All time',
      metrics: {
        totalJobs,
        completedJobs,
        failedJobs,
        processingJobs,
        avgProcessingTimeMinutes: Math.round(avgProcessingTime),
        successRate: `${successRate}%`,
        failureRate: `${failureRate}%`,
      },
      jobsByStatus: jobsByStatusData,
      topClients: jobsByClientData,
    };

    if (format === 'csv') {
      const csvRows = [
        ['Metric', 'Value'],
        ['Total Jobs', totalJobs.toString()],
        ['Completed Jobs', completedJobs.toString()],
        ['Failed Jobs', failedJobs.toString()],
        ['Processing Jobs', processingJobs.toString()],
        ['Avg Processing Time (minutes)', Math.round(avgProcessingTime).toString()],
        ['Success Rate (%)', successRate],
        ['Failure Rate (%)', failureRate],
      ];
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading report data..." />;
  }

  if (error) {
    return (
      <div>
        <Alert variant="error" title="Error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-1">System metrics and analytics</p>
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

      {/* Date Range Filter */}
      <div className="bg-white rounded border border-gray-200 p-4 mb-6">
        <DateRangePicker
          label="Filter by Date Range"
          startDate={dateRange?.start}
          endDate={dateRange?.end}
          onStartDateChange={(start: string) =>
            setDateRange(start && dateRange?.end ? { start, end: dateRange.end } : null)
          }
          onEndDateChange={(end: string) =>
            setDateRange(dateRange?.start && end ? { start: dateRange.start, end } : null)
          }
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Jobs"
          value={totalJobs}
          color="primary"
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          color="success"
        />
        <StatCard
          label="Avg Processing Time"
          value={`${Math.round(avgProcessingTime)} min`}
          color="neutral"
        />
        <StatCard
          label="Failure Rate"
          value={`${failureRate}%`}
          color="error"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Jobs by Status */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Jobs by Status</h2>
          <JobsByStatusChart data={jobsByStatusData} />
        </div>

        {/* Jobs by Client */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Clients by Job Volume</h2>
          <JobsByClientChart data={jobsByClientData} />
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Jobs Over Time (Last 7 Days)</h2>
        <TimeSeriesChart data={timeSeriesData} />
      </div>
    </div>
  );
};

export default Reports;

