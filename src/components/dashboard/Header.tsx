import { useState } from 'react';
import { User } from '@/types';
import { AuthService } from '@/services/auth';
import Image from 'next/image';

interface HeaderProps {
  user: User | null;
  isDatabaseConnected: boolean;
  onOpenConnectionModal: () => void;
}

export const Header = ({ user, isDatabaseConnected, onOpenConnectionModal }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  // Generate user initials for the avatar if no profile image is available
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mr-8">Dashboard</h1>
          <button
            onClick={onOpenConnectionModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            {isDatabaseConnected ? 'Reconnect Database' : 'Connect Database'}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden">
                {user?.profile_image ? (
                  <Image 
                    src={user.profile_image}
                    alt={`${user.username}'s profile`}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="font-medium text-lg">{getUserInitials()}</span>
                )}
              </div>
              <span className="ml-2 text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.username}
              </span>
              <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="px-4 py-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Member since
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-2 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};