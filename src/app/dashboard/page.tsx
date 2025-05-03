"use client";
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  email: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true); // Assume authenticated until proven otherwise
  const router = useRouter();

  useEffect(() => {
    // Check for authentication token
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

    // Only proceed with fetching user if authenticated
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

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Log out
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {user ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 p-4">
              <h2 className="text-2xl mb-4">Welcome, {user.username}!</h2>
              <p className="mb-2"><strong>Email:</strong> {user.email}</p>
              <p className="mb-2"><strong>Account created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </main>
    </div>
  );
}