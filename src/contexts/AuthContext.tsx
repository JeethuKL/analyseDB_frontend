"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';

interface User {
  id: number;
  username: string;
  email: string;
  is_disabled: boolean;
  database_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const fetchCurrentUser = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data', error);
      AuthService.logout();
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.login({ username, password });
      await fetchCurrentUser();
    } finally {
      setLoading(false);
    }
  };
  
  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signup({ username, email, password });
      await login(username, password);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/');
  };
  
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};