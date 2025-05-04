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
  // Always use the message's own data if available, fall back to the current data if this is the last message
  const useMessageData = true; // Always prefer message's own data
  
  const shouldDisplaySql = message.role !== 'user' && 
    (message.type === 'results' || message.type === 'correction' || message.sql);
  
  // Prefer message's own data over current data
  const sqlToShow = message.sql || (isLastMessage ? currentSql : null);
  const resultsToShow = message.results || (isLastMessage ? currentResults : null);
  const visualizationToShow = message.visualization || (isLastMessage ? currentVisualization : null);

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
        {/* Message content including any streaming text */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {/* Display SQL code if available */}
        {shouldDisplaySql && sqlToShow && (
          <div className="mt-3 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
            <pre>{sqlToShow}</pre>
          </div>
        )}
        
        {/* Display results table if available */}
        {(message.type === 'results' || resultsToShow) && resultsToShow?.columns && (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
              <thead>
                <tr>
                  {resultsToShow.columns.map((col, i) => (
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
                {resultsToShow.rows && resultsToShow.rows.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    {resultsToShow.columns.map((col, j) => (
                      <td key={j} className="px-3 py-2 text-xs">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {resultsToShow.rows && resultsToShow.rows.length > 10 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Showing 10 of {resultsToShow.rows.length} results
              </p>
            )}
          </div>
        )}
        
        {/* Display visualization if available */}
        {visualizationToShow && (
          <div className="mt-4">
            <Visualization visualization={visualizationToShow} />
          </div>
        )}
        
        <div className="mt-1 text-xs opacity-70 text-right">
          {formatTimestamp()}
        </div>
      </div>
    </div>
  );
};