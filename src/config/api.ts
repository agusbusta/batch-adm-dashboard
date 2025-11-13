// API Configuration
// Switch between mock data and real API

export const API_CONFIG = {
  useMockData: import.meta.env.VITE_USE_MOCK !== 'false', // Default to true for now
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  mockDelay: 500, // ms to simulate API latency
};

