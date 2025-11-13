// API service for Admin Dashboard

import axios from 'axios';
import type { Job, Client, Credit, CreditTransaction, GPUResource, SystemLog } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized) - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Redirect to login (only if not already there)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Jobs API
export const jobsApi = {
  getAll: (filters?: { status?: string; client_id?: string; start_date?: string; end_date?: string }) => {
    return api.get<Job[]>('/jobs', { params: filters });
  },
  getById: (id: string) => {
    return api.get<Job>(`/jobs/${id}`);
  },
  getStatusHistory: (id: string) => {
    return api.get(`/jobs/${id}/status-history`);
  },
  getLogs: (id: string) => {
    return api.get<SystemLog[]>(`/jobs/${id}/logs`);
  },
  updatePriority: (id: string, priority: number) => {
    return api.put(`/jobs/${id}/priority`, { priority });
  },
};

// Clients API
export const clientsApi = {
  getAll: () => {
    return api.get<Client[]>('/clients');
  },
  getById: (id: string) => {
    return api.get<Client>(`/clients/${id}`);
  },
  create: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<Client>('/clients', data);
  },
  update: (id: string, data: Partial<Client>) => {
    return api.put<Client>(`/clients/${id}`, data);
  },
  getJobs: (id: string) => {
    return api.get<Job[]>(`/clients/${id}/jobs`);
  },
};

// Credits API
export const creditsApi = {
  getBalance: (clientId: string) => {
    return api.get<Credit>(`/clients/${clientId}/credits`);
  },
  addCredits: (clientId: string, amount: number) => {
    return api.post(`/clients/${clientId}/credits`, { amount });
  },
  getTransactions: (clientId: string) => {
    return api.get<CreditTransaction[]>(`/clients/${clientId}/transactions`);
  },
  check: (clientId: string) => {
    return api.post<{ has_sufficient_credits: boolean; balance: number }>('/credits/check', { client_id: clientId });
  },
};

// GPU API
export const gpuApi = {
  getAll: () => {
    return api.get<GPUResource[]>('/gpu');
  },
  getAvailable: () => {
    return api.get<GPUResource[]>('/gpu/available');
  },
  getQueue: () => {
    return api.get<Job[]>('/jobs/queue');
  },
  updatePriority: (jobId: string, priority: number) => {
    return api.put(`/jobs/queue/${jobId}/priority`, { priority });
  },
};

// Logs API
export const logsApi = {
  getAll: (filters?: { level?: string; module?: string; start_date?: string; end_date?: string }) => {
    return api.get<SystemLog[]>('/logs', { params: filters });
  },
};

// Reports API
export const reportsApi = {
  getUsage: (filters?: { start_date?: string; end_date?: string; client_id?: string }) => {
    return api.get('/reports/usage', { params: filters });
  },
  getJobs: (filters?: { start_date?: string; end_date?: string }) => {
    return api.get('/reports/jobs', { params: filters });
  },
};

// Auth API
export const authApi = {
  login: (email: string, password: string) => {
    return api.post<{ token: string; user: any }>('/auth/login', { email, password });
  },
  logout: () => {
    return api.post('/auth/logout');
  },
  getMe: () => {
    return api.get('/auth/me');
  },
};

export default api;

