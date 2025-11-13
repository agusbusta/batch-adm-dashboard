import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_CONFIG } from '../config/api';
import { authApi } from '../services/api';
import { getMockLogin } from '../services/mockData';
import type { User } from '../types';
import { AuthContext, type AuthContextType } from './authContextDef';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      let response: { token: string; user: User };

      if (API_CONFIG.useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        response = getMockLogin(email, password);
      } else {
        const apiResponse = await authApi.login(email, password);
        response = apiResponse.data;
      }

      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    if (!API_CONFIG.useMockData) {
      authApi.logout().catch(console.error);
    }
    
    // Use window.location instead of navigate since we're outside Router context
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

