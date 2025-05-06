"use client";
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import Script from 'next/script';
import { User } from '@/types';
import {
  Header,
  DatabaseChat,
  DatabaseConnectionModal,
} from '@/components/dashboard';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);

  // Check if database is connected (based on localStorage)
  useEffect(() => {
    const checkDbConnection = () => {
      const isConnected = typeof window !== 'undefined' && !!localStorage.getItem('dbSchema');
      setDatabaseConnected(isConnected);
    };
    
    checkDbConnection();
    
    // Listen for localStorage changes (helpful for when database is connected)
    window.addEventListener('storage', checkDbConnection);
    return () => window.removeEventListener('storage', checkDbConnection);
  }, []);

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      console.log('Checking auth token:', !!token);

      if (!token) {
        console.log('No auth token found, redirecting to login');
        setAuthenticated(false);
        window.location.href = '/login';
        return false;
      }
      return true;
    };

    const fetchUserData = async () => {
      if (!checkAuth()) return;

      try {
        const userData = await AuthService.getCurrentUser();
        console.log('User data loaded successfully');
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        AuthService.logout(); // Clear invalid token
        setAuthenticated(false);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle database connection success
  const handleDatabaseConnected = () => {
    setDatabaseConnected(true);
    // Trigger the "storage" event to update other components that rely on localStorage
    window.dispatchEvent(new Event('storage'));
  };

  // Show loading state if we're still loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  // If not authenticated, show a redirect message
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Load Plotly from CDN with specific version */}
      <Script
        src="https://cdn.plot.ly/plotly-2.27.1.min.js"
        strategy="afterInteractive"
      />
      
      {/* Fixed header */}
      <div className="w-full">
        <Header 
          user={user} 
          isDatabaseConnected={databaseConnected} 
          onOpenConnectionModal={() => setIsModalOpen(true)} 
        />
      </div>

      {/* Main content with proper spacing - remove fixed height */}
      <main className="flex-1 max-w-7xl w-full mx-auto pt-4 pb-0 px-4 sm:px-6 lg:px-8 flex flex-col">
        <DatabaseChat 
          user={user} 
          isDatabaseConnected={databaseConnected} 
          onOpenConnectionModal={() => setIsModalOpen(true)} 
        />
      </main>

      {/* Database Connection Modal */}
      <DatabaseConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSuccess={handleDatabaseConnected}
      />
    </div>
  );
}