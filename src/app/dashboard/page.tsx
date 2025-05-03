"use client";
import { useEffect, useState, useRef } from 'react';
import { AuthService } from '@/services/auth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Script from 'next/script';

// Import Plotly dynamically to avoid SSR issues
const PlotlyComponent = dynamic(
  () => import('plotly.js-dist').then((mod) => {
    // Return an empty component, we'll use the global Plotly object
    return () => null;
  }),
  { ssr: false }
);

// This will hold the actual Plotly object
let Plotly: any = null;
if (typeof window !== 'undefined') {
  // Only in browser
  import('plotly.js-dist').then((mod) => {
    Plotly = mod.default || mod;
  });
}

interface User {
  username: string;
  email: string;
  created_at: string;
  id: number | string; // Support both string and number types for id
}

interface SchemaResponse {
  tables: any[];
  success: boolean;
  message: string;
  table_count: number;
  timestamp: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: string;
  timestamp: Date;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

interface VisualizationData {
  type: string;
  plotly_code: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbUrl, setDbUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    tableCount?: number;
  } | null>(null);

  // Chat related states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSql, setCurrentSql] = useState<string | null>(null);
  const [currentResults, setCurrentResults] = useState<QueryResult | null>(null);
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const [visualizationId, setVisualizationId] = useState(0);
  const router = useRouter();
  const isDatabaseConnected = typeof window !== 'undefined' && !!localStorage.getItem('dbSchema');

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

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a new useEffect to render Plotly visualizations when they're received
  useEffect(() => {
    if (currentVisualization && visualizationRef.current) {
      try {
        // Wait for Plotly to be available
        if (typeof Plotly !== 'undefined') {
          // Clear previous visualization
          visualizationRef.current.innerHTML = '';
          
          // Create a unique ID for this visualization
          const vizId = `viz-${visualizationId}`;
          setVisualizationId(prev => prev + 1);
          
          // Create a container for the visualization
          const vizContainer = document.createElement('div');
          vizContainer.id = vizId;
          vizContainer.style.width = '100%';
          vizContainer.style.height = '300px';
          visualizationRef.current.appendChild(vizContainer);
          
          // Safety check for empty plotly_code
          if (currentVisualization.plotly_code && currentVisualization.plotly_code.trim() !== '') {
            // Log the code for debugging
            console.log('Executing Plotly code:', currentVisualization.plotly_code);
            
            // Safety mechanism to execute only valid plotly code
            const sanitizedCode = currentVisualization.plotly_code
              .replace(/document\./g, '') // Prevent direct document access
              .replace(/window\./g, '');  // Prevent window access
            
            // Check if code has valid Plotly commands
            if (sanitizedCode.includes('Plotly.newPlot') || 
                sanitizedCode.includes('Plotly.plot') || 
                sanitizedCode.includes('Plotly.react')) {
              
              // Create a function that will execute the code with plotly available
              const executePlotlyCode = new Function('Plotly', 'container', `
                try {
                  ${sanitizedCode}
                } catch (e) {
                  console.error('Error executing Plotly code:', e);
                  return false;
                }
                return true;
              `);
              
              // Execute the code with the Plotly library and container ID
              const success = executePlotlyCode(Plotly, vizId);
              
              if (!success) {
                // Fallback to basic chart if execution failed
                renderBasicChart(currentVisualization, vizId);
              }
            } else {
              // If code doesn't contain valid Plotly commands, use basic chart
              renderBasicChart(currentVisualization, vizId);
            }
          } else {
            // Handle case where no plotly_code is provided but there's data
            renderBasicChart(currentVisualization, vizId);
          }
        }
      } catch (error) {
        console.error('Error rendering visualization:', error);
        if (visualizationRef.current) {
          visualizationRef.current.innerHTML = '<p class="text-red-500 p-3">Error rendering visualization</p>';
        }
      }
    }
  }, [currentVisualization, visualizationId]);

  // Helper function to render basic charts when no plotly_code is provided
  const renderBasicChart = (visualization: VisualizationData, containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      if (visualization.type === 'bar') {
        // Render a basic bar chart
        Plotly.newPlot(containerId, [{
          x: ['Sample A', 'Sample B', 'Sample C', 'Sample D'],
          y: [10, 15, 13, 17],
          type: 'bar'
        }], {
          title: 'Sample Bar Chart',
          margin: { t: 30, b: 40, l: 30, r: 10 }
        });
      } 
      else if (visualization.type === 'line' || visualization.type === 'scatter') {
        // Render a basic line chart
        Plotly.newPlot(containerId, [{
          x: [1, 2, 3, 4, 5],
          y: [10, 15, 13, 17, 20],
          type: visualization.type
        }], {
          title: `Sample ${visualization.type === 'line' ? 'Line' : 'Scatter'} Chart`,
          margin: { t: 30, b: 40, l: 30, r: 10 }
        });
      }
      else if (visualization.type === 'pie') {
        // Render a basic pie chart
        Plotly.newPlot(containerId, [{
          values: [30, 20, 15, 35],
          labels: ['Category A', 'Category B', 'Category C', 'Category D'],
          type: 'pie'
        }], {
          title: 'Sample Pie Chart', 
          margin: { t: 30, b: 10, l: 10, r: 10 }
        });
      }
      else if (visualization.type === 'text') {
        // For text visualizations, just display formatted text
        container.innerHTML = `<div class="p-3 font-mono text-sm overflow-auto">${visualization.plotly_code || 'No data available'}</div>`;
      }
      else {
        // Generic fallback for any chart type
        container.innerHTML = `<div class="p-3 text-center">
          <p class="text-gray-500">Chart type "${visualization.type}" not directly supported</p>
          <p class="text-sm mt-1">Try asking for a bar, line, or pie chart</p>
        </div>`;
      }
    } catch (err) {
      console.error('Error in fallback visualization:', err);
      container.innerHTML = '<div class="p-3 text-red-500">Could not render visualization</div>';
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  const handleConnectDatabase = async () => {
    if (!dbUrl.trim()) {
      setConnectionStatus({
        success: false,
        message: "Database URL is required"
      });
      return;
    }

    setConnecting(true);
    setConnectionStatus(null);

    try {
      const response = await api.post<SchemaResponse>('/operations/getSchema', {
        db_url: dbUrl,
        user_id: String(user?.id), // Convert to string as required by API
        gemini_api_key: geminiApiKey.trim() || undefined
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

        // Add welcome message to chat
        setMessages([
          {
            role: 'assistant',
            content: `Database connected successfully! Found ${data.table_count} tables. You can now ask questions about your data.`,
            timestamp: new Date(),
            type: 'status'
          }
        ]);

        // Close modal after successful connection with slight delay
        setTimeout(() => {
          setIsModalOpen(false);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isProcessing) return;

    if (!isDatabaseConnected) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Please connect to a database first before asking questions.',
          timestamp: new Date(),
          type: 'error'
        }
      ]);
      return;
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Reset current response elements
    setCurrentSql(null);
    setCurrentResults(null);
    setCurrentVisualization(null);
    setCurrentStatus('Processing your query...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: String(user?.id)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let responseMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            // Handle different response types
            switch (data.type) {
              case 'status':
                setCurrentStatus(data.message);
                break;

              case 'sql':
                setCurrentSql(data.data);
                setCurrentStatus('Executing SQL query...');
                break;

              case 'results':
                // Handle different result formats
                if (data.data) {
                  let formattedResults: QueryResult | null = null;
                  
                  // Check if data.data has columns and rows directly
                  if (Array.isArray(data.data.columns) && Array.isArray(data.data.rows)) {
                    formattedResults = data.data as QueryResult;
                  } 
                  // Check if data.data is an array of objects (common API response format)
                  else if (Array.isArray(data.data)) {
                    // If it's an array of objects, extract columns from the first item
                    if (data.data.length > 0) {
                      const columns = Object.keys(data.data[0]);
                      formattedResults = {
                        columns: columns,
                        rows: data.data
                      };
                    } else {
                      formattedResults = {
                        columns: [],
                        rows: []
                      };
                    }
                  }
                  
                  if (formattedResults) {
                    setCurrentResults(formattedResults);
                    setCurrentStatus('Formatting results...');
                    responseMessage = {
                      ...responseMessage,
                      content: generateResultsText(formattedResults),
                      type: 'results'
                    };
                  } else {
                    console.error('Received unprocessable results data:', data.data);
                    setCurrentResults(null);
                    responseMessage = {
                      ...responseMessage,
                      content: "Received results in an unexpected format.",
                      type: 'error'
                    };
                  }
                } else {
                  console.error('Missing data in results response');
                  setCurrentResults(null);
                  responseMessage = {
                    ...responseMessage,
                    content: "No results data received from the server.",
                    type: 'error'
                  };
                }
                break;

              case 'visualization':
                try {
                  if (data.data && typeof data.data === 'object') {
                    // Extract type and plotly_code, provide defaults if missing
                    const vizType = data.data.type || 'bar';
                    const plotlyCode = data.data.plotly_code || '';
                    
                    setCurrentVisualization({
                      type: vizType,
                      plotly_code: plotlyCode
                    });
                    
                    console.log(`Received ${vizType} visualization with code length: ${plotlyCode.length}`);
                    setCurrentStatus('Rendering visualization...');
                  } else {
                    console.error('Invalid visualization data format:', data.data);
                  }
                } catch (error) {
                  console.error('Error processing visualization data:', error);
                }
                break;

              case 'chat':
              case 'clarification':
                responseMessage = {
                  ...responseMessage,
                  content: data.message,
                  type: data.type
                };
                break;

              case 'error':
                responseMessage = {
                  ...responseMessage,
                  content: data.message,
                  type: 'error'
                };
                setCurrentStatus(null);
                break;

              case 'empty_results':
                responseMessage = {
                  ...responseMessage,
                  content: data.data.explanation,
                  type: 'empty_results'
                };
                break;

              case 'correction':
                setCurrentSql(data.sql);
                responseMessage = {
                  ...responseMessage,
                  content: `I found an issue with the query, so I corrected it. ${data.analysis}`,
                  type: 'correction'
                };
                break;
            }
          } catch (e) {
            console.error('Error parsing JSON chunk:', e, line);
          }
        }
      }

      // If we haven't set content yet, create a default message
      if (!responseMessage.content) {
        responseMessage.content = "I've processed your query. Check the results below.";
      }

      // Add the assistant's response message
      setMessages(prev => [...prev, responseMessage]);

    } catch (error) {
      console.error('Query streaming failed:', error);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error processing your query: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          type: 'error'
        }
      ]);
    } finally {
      setIsProcessing(false);
      setCurrentStatus(null);
    }
  };

  // Helper function to generate readable text from query results
  const generateResultsText = (results: QueryResult): string => {
    if (!results || !results.rows || !Array.isArray(results.rows) || results.rows.length === 0) {
      return "The query returned no results.";
    }
    
    const rowCount = results.rows.length;
    return `Found ${rowCount} ${rowCount === 1 ? 'result' : 'results'}. You can see the data below.`;
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
      <Script
        src="https://cdn.plot.ly/plotly-2.24.1.min.js"
        strategy="afterInteractive"
      />
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mr-8">Dashboard</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              {isDatabaseConnected ? 'Reconnect Database' : 'Connect Database'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-300">
              Welcome, <span className="font-semibold">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar with user info */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Account Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account created</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(user?.created_at || '').toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Database status</dt>
                    <dd className="mt-1 text-sm">
                      {isDatabaseConnected ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                          Not connected
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Main chat area */}
          <div className="md:col-span-9">
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg flex flex-col h-[600px]">
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Database Chat
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ask questions about your database using natural language
                </p>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(600px - 160px)" }}>
                {messages.length === 0 && !isDatabaseConnected && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 max-w-sm mx-auto">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5v14" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No database connected</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Connect to a database to start asking questions
                      </p>
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Connect Database
                      </button>
                    </div>
                  </div>
                )}

                {messages.length === 0 && isDatabaseConnected && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 max-w-sm mx-auto">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Start a conversation</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Ask a question about your database to get started
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => {
                  // Track if this message should display SQL and visualization
                  const shouldDisplaySql = message.type !== 'user' && 
                                          (message.type === 'results' || message.type === 'correction');
                  
                  // Generate a unique key for current message
                  const messageKey = `msg-${index}-${message.timestamp.getTime()}`;
                  
                  return (
                    <div
                      key={messageKey}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        } ${message.type === 'error' ? 'border-l-4 border-red-500' : ''}`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Display SQL code if available */}
                        {shouldDisplaySql && currentSql && (
                          <div className="mt-3 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
                            <pre>{currentSql}</pre>
                          </div>
                        )}
                        
                        {/* Display results table if available */}
                        {message.type === 'results' && currentResults && currentResults.columns && (
                          <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                              <thead>
                                <tr>
                                  {currentResults.columns.map((col, i) => (
                                    <th
                                      key={i}
                                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentResults.rows && currentResults.rows.slice(0, 10).map((row, i) => (
                                  <tr key={i}>
                                    {currentResults.columns.map((col, j) => (
                                      <td key={j} className="px-3 py-2 text-xs">
                                        {String(row[col] ?? '')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {currentResults.rows && currentResults.rows.length > 10 && (
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Showing 10 of {currentResults.rows.length} results
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Display visualization if available */}
                        {index === messages.length - 1 && currentVisualization && (
                          <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            <div 
                              ref={visualizationRef}
                              className="w-full" 
                              style={{ minHeight: '250px' }} 
                            ></div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 p-2 border-t border-gray-200 dark:border-gray-700">
                              Visualization type: {currentVisualization.type}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-1 text-xs opacity-70 text-right">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <div className="animate-pulse flex space-x-2">
                          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                        </div>
                        <span className="ml-2 text-sm">{currentStatus || 'Processing...'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isDatabaseConnected ? "Ask a question about your database..." : "Connect a database first..."}
                    disabled={!isDatabaseConnected || isProcessing}
                    className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!isDatabaseConnected || isProcessing || !input.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Database Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect to Database</h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="postgresql://username:password@localhost:5432/database"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter your database connection string
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Google Gemini API key for enhanced schema analysis
                </p>
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
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectDatabase}
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
      )}
    </div>
  );
}