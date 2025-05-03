import { ChatMessage as ChatMessageType, QueryResult, VisualizationData } from '@/types';
import { Visualization } from './Visualization';

interface ChatMessageProps {
  message: ChatMessageType;
  currentSql: string | null;
  currentResults: QueryResult | null;
  currentVisualization: VisualizationData | null;
  isLastMessage: boolean;
}

export const ChatMessage = ({ 
  message, 
  currentSql, 
  currentResults, 
  currentVisualization, 
  isLastMessage 
}: ChatMessageProps) => {
  // Track if this message should display SQL and visualization
  const shouldDisplaySql = message.role !== 'user' && 
    (message.type === 'results' || message.type === 'correction');
    
  // Format the timestamp properly by ensuring it's a Date object
  const formatTimestamp = () => {
    if (!message.timestamp) return '';
    
    // If it's already a Date object
    if (message.timestamp instanceof Date) {
      return message.timestamp.toLocaleTimeString();
    }
    
    // If it's a string, convert to Date first
    try {
      return new Date(message.timestamp).toLocaleTimeString();
    } catch (e) {
      console.error('Invalid timestamp format:', message.timestamp);
      return '';
    }
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
        {isLastMessage && currentVisualization && (
          <Visualization visualization={currentVisualization} />
        )}
        
        <div className="mt-1 text-xs opacity-70 text-right">
          {formatTimestamp()}
        </div>
      </div>
    </div>
  );
};