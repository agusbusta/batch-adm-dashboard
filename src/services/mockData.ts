// Mock Data Service for Admin Dashboard
// This will be replaced with real API calls when backend is ready

import type { Job, Client, Credit, CreditTransaction, GPUResource, SystemLog, JobStatusHistory, User } from '../types';

// Helper to simulate API delay
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to simulate random errors (for testing)
export const simulateApiError = (probability: number = 0.1): boolean => {
  return Math.random() < probability;
};

// Generate historical data for charts (last 7 days)
export const generateHistoricalData = (
  currentValue: number,
  days: number = 7,
  variance: number = 0.3
): Array<{ date: string; value: number }> => {
  const data: Array<{ date: string; value: number }> = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate value with some variance but trending towards current value
    const trendFactor = (days - i) / days; // More recent = closer to current
    const baseValue = currentValue * (0.7 + trendFactor * 0.3); // Start at 70%, end at 100%
    const randomVariance = (Math.random() - 0.5) * variance * currentValue;
    const value = Math.max(0, Math.round(baseValue + randomVariance));
    
    data.push({
      date: date.toISOString(),
      value,
    });
  }
  
  return data;
};

// Generate mock clients
export const generateMockClients = (count: number = 10): Client[] => {
  const clients: Client[] = [];
  const names = ['Acme Corp', 'Tech Solutions', 'Media Studio', 'Creative Agency', 'Production House', 'Film Company', 'Video Pro', 'Digital Media', 'Content Creators', 'Studio One'];
  
  for (let i = 0; i < count; i++) {
    clients.push({
      id: `client-${i + 1}`,
      name: names[i] || `Client ${i + 1}`,
      email: `client${i + 1}@example.com`,
      masv_portal_config: {
        folder_path: `/masv/client-${i + 1}`,
        sync_enabled: true,
      },
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return clients;
};

// Generate mock jobs
export const generateMockJobs = (count: number = 20, clientIds: string[]): Job[] => {
  const jobs: Job[] = [];
  const statuses: Job['status'][] = ['pending', 'processing', 'completed', 'failed', 'queued'];
  const modules = ['module1', 'module2', 'module3', null];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
    const created = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    jobs.push({
      id: `job-${i + 1}`,
      client_id: clientId,
      status,
      current_module: status === 'processing' ? (modules[Math.floor(Math.random() * modules.length)] as any) : undefined,
      progress: status === 'completed' ? 100 : status === 'processing' ? Math.floor(Math.random() * 80) + 10 : 0,
      input_files: {
        files: [`input_${i + 1}.raw`],
        total_size: Math.floor(Math.random() * 100) + 10,
      },
      output_files: status === 'completed' ? {
        files: [`output_${i + 1}.prores`],
        total_size: Math.floor(Math.random() * 80) + 5,
      } : undefined,
      metadata: {
        color_space: 'Rec.709',
        gamma: '2.4',
        resolution: '4K',
      },
      started_at: status !== 'pending' ? new Date(created.getTime() + 1000 * 60 * 60).toISOString() : undefined,
      completed_at: status === 'completed' ? new Date(created.getTime() + 1000 * 60 * 60 * 2).toISOString() : undefined,
      created_at: created.toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return jobs;
};

// Generate mock credits
export const generateMockCredits = (clientIds: string[]): Credit[] => {
  return clientIds.map(clientId => ({
    id: `credit-${clientId}`,
    client_id: clientId,
    balance: Math.floor(Math.random() * 10000) + 100,
    updated_at: new Date().toISOString(),
  }));
};

// Generate mock credit transactions
export const generateMockTransactions = (clientId: string, count: number = 10): CreditTransaction[] => {
  const transactions: CreditTransaction[] = [];
  const types: CreditTransaction['type'][] = ['add', 'subtract', 'usage'];
  
  for (let i = 0; i < count; i++) {
    transactions.push({
      id: `transaction-${clientId}-${i + 1}`,
      client_id: clientId,
      amount: Math.floor(Math.random() * 1000) + 10,
      type: types[Math.floor(Math.random() * types.length)],
      description: `Transaction ${i + 1}`,
      job_id: i % 3 === 0 ? `job-${Math.floor(Math.random() * 20)}` : undefined,
      created_at: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Generate mock GPU resources
export const generateMockGPUResources = (count: number = 4): GPUResource[] => {
  const gpus: GPUResource[] = [];
  const statuses: GPUResource['status'][] = ['available', 'in_use', 'maintenance'];
  const names = ['GPU-01', 'GPU-02', 'GPU-03', 'GPU-04'];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    gpus.push({
      id: `gpu-${i + 1}`,
      name: names[i] || `GPU-${String(i + 1).padStart(2, '0')}`,
      status,
      current_job_id: status === 'in_use' ? `job-${Math.floor(Math.random() * 20)}` : undefined,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return gpus;
};

// Generate mock system logs
export const generateMockLogs = (count: number = 50, jobIds?: string[]): SystemLog[] => {
  const logs: SystemLog[] = [];
  const levels: SystemLog['level'][] = ['info', 'warning', 'error', 'debug'];
  const modules = ['module1', 'module2', 'module3', 'bam', 'transfer', 'masv'];
  const messages = [
    'Job started processing',
    'Module 1 completed successfully',
    'GPU allocated',
    'File transfer initiated',
    'Credit check passed',
    'Error in processing',
    'Job queued',
    'Processing complete',
  ];
  
  for (let i = 0; i < count; i++) {
    logs.push({
      id: `log-${i + 1}`,
      level: levels[Math.floor(Math.random() * levels.length)],
      module: modules[Math.floor(Math.random() * modules.length)],
      job_id: jobIds && Math.random() > 0.3 ? jobIds[Math.floor(Math.random() * jobIds.length)] : undefined,
      message: messages[Math.floor(Math.random() * messages.length)],
      metadata: {
        timestamp: new Date().toISOString(),
      },
      created_at: new Date(Date.now() - (count - i) * 60 * 1000).toISOString(),
    });
  }
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Mock Login
export const getMockLogin = (email: string, password: string): { token: string; user: User } => {
  // Simulate API delay
  if (simulateApiError(0.05)) {
    throw new Error('Network error. Please try again.');
  }

  // Mock credentials (in production, this would be validated against backend)
  if (email === 'admin@example.com' && password === 'password') {
    const user: User = {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    };

    // Generate a mock JWT token (in production, this comes from backend)
    const token = 'mock_jwt_token_' + Date.now();

    return { token, user };
  }

  throw new Error('Invalid email or password');
};

// Generate mock job status history
export const generateMockJobStatusHistory = (jobId: string): JobStatusHistory[] => {
  const history: JobStatusHistory[] = [];
  const statuses = ['pending', 'queued', 'processing', 'completed'];
  const modules = ['module1', 'module2', 'module3'];
  
  statuses.forEach((status, index) => {
    history.push({
      id: `history-${jobId}-${index}`,
      job_id: jobId,
      status,
      module: status === 'processing' ? modules[index - 1] : undefined,
      message: `Job moved to ${status}`,
      created_at: new Date(Date.now() - (statuses.length - index) * 30 * 60 * 1000).toISOString(),
    });
  });
  
  return history;
};

// Store mock data (simulates database)
let mockClients: Client[] = [];
let mockJobs: Job[] = [];
let mockCredits: Credit[] = [];
let mockGPUs: GPUResource[] = [];

// Initialize mock data
export const initializeMockData = () => {
  mockClients = generateMockClients(10);
  mockCredits = generateMockCredits(mockClients.map(c => c.id));
  mockJobs = generateMockJobs(25, mockClients.map(c => c.id));
  mockGPUs = generateMockGPUResources(4);
};

// Get mock data functions (simulate API calls)
export const getMockClients = async (): Promise<Client[]> => {
  await simulateApiDelay(300);
  if (simulateApiError(0.05)) throw new Error('Failed to fetch clients');
  return mockClients;
};

export const getMockJobs = async (filters?: { status?: string; client_id?: string }): Promise<Job[]> => {
  await simulateApiDelay(400);
  if (simulateApiError(0.05)) throw new Error('Failed to fetch jobs');
  
  let filtered = [...mockJobs];
  if (filters?.status) {
    filtered = filtered.filter(j => j.status === filters.status);
  }
  if (filters?.client_id) {
    filtered = filtered.filter(j => j.client_id === filters.client_id);
  }
  return filtered;
};

export const getMockJobById = async (id: string): Promise<Job | null> => {
  await simulateApiDelay(200);
  if (simulateApiError(0.05)) throw new Error('Failed to fetch job');
  return mockJobs.find(j => j.id === id) || null;
};

export const getMockCredits = async (clientId: string): Promise<Credit | null> => {
  await simulateApiDelay(200);
  if (simulateApiError(0.05)) throw new Error('Failed to fetch credits');
  return mockCredits.find(c => c.client_id === clientId) || null;
};

export const getMockGPUResources = async (): Promise<GPUResource[]> => {
  await simulateApiDelay(300);
  if (simulateApiError(0.05)) throw new Error('Failed to fetch GPU resources');
  return mockGPUs;
};

export const getMockLogs = async (filters?: { level?: string; job_id?: string }): Promise<SystemLog[]> => {
  await simulateApiDelay(400);
  if (simulateApiError(0.05)) throw new Error('Failed to fetch logs');
  
  const jobIds = mockJobs.map(j => j.id);
  let logs = generateMockLogs(50, jobIds);
  
  if (filters?.level) {
    logs = logs.filter(l => l.level === filters.level);
  }
  if (filters?.job_id) {
    logs = logs.filter(l => l.job_id === filters.job_id);
  }
  
  return logs;
};

// Initialize on import
initializeMockData();

