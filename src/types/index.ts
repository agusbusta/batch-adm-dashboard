// Types for the Admin Dashboard

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  masv_portal_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  client_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'queued';
  current_module?: 'module1' | 'module2' | 'module3';
  progress: number; // 0-100
  input_files?: Record<string, any>;
  output_files?: Record<string, any>;
  metadata?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  client_id: string;
  balance: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  client_id: string;
  amount: number;
  type: 'add' | 'subtract' | 'usage';
  description?: string;
  job_id?: string;
  created_at: string;
}

export interface GPUResource {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance';
  current_job_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  module?: string;
  job_id?: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface JobStatusHistory {
  id: string;
  job_id: string;
  status: string;
  module?: string;
  message?: string;
  created_at: string;
}
