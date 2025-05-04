import { useState } from 'react';
import { User, ConnectionStatus } from '@/types';
import api from '@/lib/api';

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (tables: any[]) => void;
}

export const DatabaseConnectionModal = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}: DatabaseConnectionModalProps) => {
  const [dbUrl, setDbUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [errors, setErrors] = useState<{dbUrl?: string; geminiApiKey?: string}>({});

  const validateInputs = () => {
    const newErrors: {dbUrl?: string; geminiApiKey?: string} = {};
    let isValid = true;
    
    if (!dbUrl.trim()) {
      newErrors.dbUrl = "Database URL is required";
      isValid = false;
    }
    
    if (!geminiApiKey.trim()) {
      newErrors.geminiApiKey = "Gemini API key is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleConnect = async () => {
    if (!validateInputs()) {
      return;
    }

    setConnecting(true);
    setConnectionStatus(null);

    try {
      const response = await api.post('/operations/getSchema', {
        db_url: dbUrl,
        user_id: String(user?.id), // Convert to string as required by API
        gemini_api_key: geminiApiKey.trim()
      });

      const data = response.data;

      setConnectionStatus({
        success: data.success,
        message: data.message,
        tableCount: data.table_count
      });

      if (data.success) {
        // Store the schema in local storage or state management if needed
        localStorage.setItem('dbSchema', JSON.stringify(data.tables));

        // Call the success callback with tables data
        onSuccess(data.tables);

        // Close modal after successful connection with slight delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Database connection error:", error);
      setConnectionStatus({
        success: false,
        message: error.response?.data?.detail?.[0]?.msg || error.response?.data?.message || "Failed to connect to database"
      });
    } finally {
      setConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect to Database</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Database URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dbUrl}
              onChange={(e) => {
                setDbUrl(e.target.value);
                if (errors.dbUrl) setErrors({...errors, dbUrl: undefined});
              }}
              placeholder="postgresql://username:password@localhost:5432/database"
              className={`w-full px-3 py-2 border ${errors.dbUrl ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            />
            {errors.dbUrl ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dbUrl}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter your database connection string
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gemini API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                if (errors.geminiApiKey) setErrors({...errors, geminiApiKey: undefined});
              }}
              placeholder="Enter your Gemini API key"
              className={`w-full px-3 py-2 border ${errors.geminiApiKey ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
            />
            {errors.geminiApiKey ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.geminiApiKey}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Google Gemini API key for enhanced schema analysis
              </p>
            )}
          </div>

          {connectionStatus && (
            <div className={`p-3 rounded mb-4 ${connectionStatus.success ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
              <p>{connectionStatus.message}</p>
              {connectionStatus.success && connectionStatus.tableCount && (
                <p className="mt-1">Found {connectionStatus.tableCount} tables in your database.</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {connecting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </div>
            ) : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};