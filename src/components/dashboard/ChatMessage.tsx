import {
  ChatMessage as ChatMessageType,
  QueryResult,
  VisualizationData,
} from "@/types";
import { Visualization } from "./Visualization";

interface ChatMessageProps {
  message: ChatMessageType;
  currentSql: string | null;
  currentResults: QueryResult | null;
  currentVisualization: VisualizationData | null;
  isLastMessage: boolean;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  // Always use the message's own data only
  const shouldDisplaySql =
    message.role !== "user" &&
    (message.type === "results" ||
      message.type === "correction" ||
      message.sql);

  const sqlToShow = message.sql;
  const resultsToShow = message.results;
  const visualizationToShow = message.visualization;

  // Format the timestamp properly by ensuring it's a Date object
  const formatTimestamp = () => {
    if (!message.timestamp) return "";

    // If it's already a Date object
    if (message.timestamp instanceof Date) {
      return message.timestamp.toLocaleTimeString();
    }

    // If it's a string, convert to Date first
    try {
      return new Date(message.timestamp).toLocaleTimeString();
    } catch (e) {
      console.error("Invalid timestamp format:", e, message.timestamp);
      return "";
    }
  };

  // Add debug logging to help troubleshoot message content issues
  console.log("Message being rendered:", {
    id: message.id,
    role: message.role,
    content: message.content,
    type: message.type,
  });

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          message.role === "user"
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        } ${message.type === "error" ? "border-l-4 border-red-500" : ""}`}
      >
        {/* Message content including any streaming text */}
        <p className="text-sm whitespace-pre-wrap">
          {message.content ||
            (message.role === "assistant" && !message.content ? "" : "")}
        </p>

        {/* Display SQL code if available */}
        {shouldDisplaySql && sqlToShow && (
          <div className="bg-gray-800 mt-3 p-2 rounded overflow-x-auto text-gray-100 text-xs">
            <pre>{sqlToShow}</pre>
          </div>
        )}

        {/* Display results table if available */}
        {(message.type === "results" || resultsToShow) &&
          resultsToShow?.columns && (
            <div className="mt-3 overflow-x-auto">
              <table className="divide-y divide-gray-300 dark:divide-gray-600 min-w-full">
                <thead>
                  <tr>
                    {resultsToShow.columns.map((col, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {resultsToShow.rows &&
                    resultsToShow.rows.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {resultsToShow.columns.map((col, j) => (
                          <td key={j} className="px-3 py-2 text-xs">
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
              {resultsToShow.rows && resultsToShow.rows.length > 10 && (
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
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

        <div className="opacity-70 mt-1 text-xs text-right">
          {formatTimestamp()}
        </div>
      </div>
    </div>
  );
};
