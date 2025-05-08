import { useState, useRef, useEffect } from "react";
import {
  User,
  ChatMessage as ChatMessageType,
  QueryResult,
  VisualizationData,
  ChatSession,
} from "@/types";
import { ChatMessage } from "./ChatMessage";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHistoryService } from "@/services/chatHistory";

interface DatabaseChatProps {
  user: User | null;
  isDatabaseConnected: boolean;
  onOpenConnectionModal: () => void;
}

export const DatabaseChat = ({
  user,
  isDatabaseConnected,
  onOpenConnectionModal,
}: DatabaseChatProps) => {
  // Chat related states
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSql, setCurrentSql] = useState<string | null>(null);
  const [currentResults, setCurrentResults] = useState<QueryResult | null>(
    null
  );
  const [currentVisualization, setCurrentVisualization] =
    useState<VisualizationData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Message limit warning
  const [showMessageLimitWarning, setShowMessageLimitWarning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create initial chat session on component mount
  useEffect(() => {
    if (!currentSessionId) {
      const newSession = ChatHistoryService.createSession();
      setCurrentSessionId(newSession.id);
    }
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      const session = ChatHistoryService.getSessionById(currentSessionId);
      if (session) {
        setMessages(session.messages);
        // Check if we've reached the message limit
        checkMessageLimit(session);
      }
    }
  }, [currentSessionId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if the current session has reached the message limit
  const checkMessageLimit = (session?: ChatSession | null) => {
    const currentSession =
      session ||
      (currentSessionId
        ? ChatHistoryService.getSessionById(currentSessionId)
        : null);

    if (currentSession) {
      const maxMessages = ChatHistoryService.getMaxMessagesPerChat();
      setShowMessageLimitWarning(currentSession.messages.length >= maxMessages);
    }
  };

  // Handle new chat creation
  const handleNewChat = () => {
    const newSession = ChatHistoryService.createSession();
    setCurrentSessionId(newSession.id);
    setMessages([]);
    resetChatState();
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // Load an existing chat session
  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setSidebarOpen(false); // Close mobile sidebar when a session is selected

    // Reset current state
    setCurrentSql(null);
    setCurrentResults(null);
    setCurrentVisualization(null);

    // Find the last results-containing message
    const lastResultsMessage = [...session.messages]
      .reverse()
      .find(
        (msg) =>
          msg.role === "assistant" &&
          (msg.results ||
            msg.visualization ||
            msg.sql ||
            msg.type === "results")
      );

    // If we have a message with results, restore that data to current state
    if (lastResultsMessage) {
      if (lastResultsMessage.sql) {
        setCurrentSql(lastResultsMessage.sql);
      }

      if (lastResultsMessage.results) {
        setCurrentResults(lastResultsMessage.results);
      }

      if (lastResultsMessage.visualization) {
        setCurrentVisualization(lastResultsMessage.visualization);
      }
    }

    // Set all messages
    setMessages(session.messages);

    // Reset message limit warning if it was shown
    setShowMessageLimitWarning(
      ChatHistoryService.hasReachedMessageLimit(session.id)
    );
  };

  // Reset chat UI state
  const resetChatState = () => {
    setInput("");
    setCurrentSql(null);
    setCurrentResults(null);
    setCurrentVisualization(null);
    setCurrentStatus(null);
    setShowMessageLimitWarning(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isProcessing || !currentSessionId) return;

    if (!isDatabaseConnected) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content:
            "Please connect to a database first before asking questions.",
          timestamp: new Date(),
          type: "error",
        },
      ]);
      return;
    }

    // Check if we've reached the message limit
    if (ChatHistoryService.hasReachedMessageLimit(currentSessionId)) {
      setShowMessageLimitWarning(true);
      return;
    }

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add to UI and save to localStorage
    setMessages((prev) => [...prev, userMessage]);
    ChatHistoryService.addMessage(currentSessionId, userMessage);

    setInput("");
    setIsProcessing(true);

    // Reset current response elements
    setCurrentSql(null);
    setCurrentResults(null);
    setCurrentVisualization(null);
    setCurrentStatus("Processing your query...");

    try {
      // Get previous context - last 5 messages maximum
      const previousContext = messages
        .slice(-5) // Take up to 5 previous messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        }/query/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            user_id: String(user?.id),
            previous_messages: previousContext, // Add previous messages for context
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Create initial response message with a unique ID based on timestamp
      const responseId = `assistant-msg-${Date.now()}`;
      const responseMessage: ChatMessageType = {
        id: responseId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      // Add empty message that will be updated as we stream
      setMessages((prev) => [...prev, responseMessage]);
      ChatHistoryService.addMessage(currentSessionId, responseMessage);
      // Track streaming content separately to avoid double appending
      let streamingContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            switch (data.type) {
              case "message":
              case "chat":
                streamingContent += data.data || data.message || "";
                responseMessage.content = streamingContent;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === responseMessage.id
                      ? { ...msg, content: streamingContent }
                      : msg
                  )
                );
                ChatHistoryService.updateMessageContent(
                  currentSessionId,
                  responseMessage.id,
                  streamingContent
                );
                break;

              case "status":
                // Update status message
                setCurrentStatus(data.message || "Processing...");
                break;

              // Keep existing cases for sql, results, visualization, etc.
              case "sql":
                setCurrentSql(data.data);
                setCurrentStatus("Executing SQL query...");
                // Save the SQL with the message and update state
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === responseMessage.id
                      ? { ...msg, sql: data.data }
                      : msg
                  )
                );
                ChatHistoryService.updateMessageWithVisualization(
                  currentSessionId,
                  responseMessage.id,
                  responseMessage.visualization || null,
                  responseMessage.results || null,
                  data.data, // SQL
                  responseMessage.content // Current content
                );
                break;

              case "results":
                try {
                  const results: QueryResult = data.data;
                  setCurrentResults(results);
                  responseMessage.type = "results";
                  responseMessage.results = results;
                  // Add formatted results text to the response
                  if (results && results.rows) {
                    const resultsText = generateResultsText(results);
                    responseMessage.content += `\n\n${resultsText}`;
                  }
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === responseMessage.id
                        ? {
                            ...msg,
                            results,
                            content: responseMessage.content,
                            type: "results",
                          }
                        : msg
                    )
                  );
                  ChatHistoryService.updateMessageWithVisualization(
                    currentSessionId,
                    responseMessage.id,
                    responseMessage.visualization || null,
                    results,
                    responseMessage.sql || null,
                    responseMessage.content
                  );
                } catch (error) {
                  console.error("Error processing results:", error);
                }
                break;

              case "visualization":
                try {
                  if (data.data && typeof data.data === "object") {
                    const vizType = data.data.type || "bar";
                    const plotlyCode = data.data.plotly_code || "";
                    const vizData = {
                      type: vizType,
                      plotly_code: plotlyCode,
                    };
                    setCurrentVisualization(vizData);
                    responseMessage.visualization = vizData;
                    responseMessage.content += `\n\nI've created a ${vizType} chart to visualize this data.`;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === responseMessage.id
                          ? {
                              ...msg,
                              visualization: vizData,
                              content: responseMessage.content,
                            }
                          : msg
                      )
                    );
                    ChatHistoryService.updateMessageWithVisualization(
                      currentSessionId,
                      responseMessage.id,
                      vizData,
                      responseMessage.results || null,
                      responseMessage.sql || null,
                      responseMessage.content
                    );
                  }
                } catch (error) {
                  console.error("Error processing visualization data:", error);
                }
                break;

              // ...other cases...
            }
          } catch (error) {
            console.error("Error parsing line:", line, error);
          }
        }
      }

      // Final update to ensure everything is saved
      ChatHistoryService.updateMessageWithVisualization(
        currentSessionId,
        responseMessage.id,
        responseMessage.visualization || null,
        responseMessage.results || null,
        responseMessage.sql || null,
        responseMessage.content
      );
    } catch (error) {
      console.error("Query streaming failed:", error);

      const errorMessage: ChatMessageType = {
        id: `error-msg-${Date.now()}`,
        role: "assistant",
        content: `Error processing your query: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
        type: "error",
      };

      setMessages((prev) => [...prev, errorMessage]);
      ChatHistoryService.addMessage(currentSessionId, errorMessage);
    } finally {
      setIsProcessing(false);
      setCurrentStatus(null);
    }
  };

  // Helper function to generate readable text from query results
  const generateResultsText = (results: QueryResult): string => {
    if (
      !results ||
      !results.rows ||
      !Array.isArray(results.rows) ||
      results.rows.length === 0
    ) {
      return "The query returned no results.";
    }

    const rowCount = results.rows.length;
    return `Found ${rowCount} ${
      rowCount === 1 ? "result" : "results"
    }. You can see the data below.`;
  };

  // Add a method to add welcome message when database is connected
  // const addWelcomeMessage = (tableCount: number) => {
  //   const welcomeMessage: ChatMessageType = {
  //     id: `welcome-msg-${Date.now()}`,
  //     role: 'assistant',
  //     content: `Database connected successfully! Found ${tableCount} tables. You can now ask questions about your data.`,
  //     timestamp: new Date(),
  //     type: 'status'
  //   };

  //   setMessages([welcomeMessage]);

  //   if (currentSessionId) {
  //     ChatHistoryService.addMessage(currentSessionId, welcomeMessage);
  //   }
  // };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 shadow sm:rounded-lg h-[calc(100vh-6rem)] overflow-hidden">
      {/* Chat header */}
      <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-gray-800 px-6 py-3 border-gray-200 dark:border-gray-700 border-b">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white text-lg leading-6">
            Database Chat
          </h3>
          <div className="flex items-center mt-1">
            <div
              className={`h-2 w-2 rounded-full mr-2 ${
                isDatabaseConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isDatabaseConnected
                ? "Connected to database"
                : "Not connected to database"}
              {!isDatabaseConnected && (
                <button
                  onClick={onOpenConnectionModal}
                  className="ml-2 text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-300 dark:text-indigo-400"
                >
                  Connect now
                </button>
              )}
            </p>
          </div>
        </div>

        {/* New Chat button on desktop + Mobile menu button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="hidden md:flex items-center bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 shadow-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-200 text-sm"
          >
            <svg
              className="mr-1 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Chat
          </button>
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat sidebar with history - now with sticky positioning */}
        <div className="hidden md:block border-gray-200 dark:border-gray-700 border-r w-64 overflow-hidden shrink-0">
          <div className="h-full overflow-y-auto">
            <ChatSidebar
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
              onNewChat={handleNewChat}
              mobileOpen={sidebarOpen}
              onCloseMobile={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className="md:hidden">
          <ChatSidebar
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
            mobileOpen={sidebarOpen}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages area - added min-height and improved padding */}
          <div className="flex-1 space-y-4 px-4 py-6 overflow-y-auto scroll-pt-4">
            {messages.length === 0 && !isDatabaseConnected && (
              <div className="flex justify-center items-center min-h-[calc(100%-80px)]">
                <div className="mx-auto p-6 max-w-sm text-center">
                  <svg
                    className="mx-auto w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5v14"
                    />
                  </svg>
                  <h3 className="mt-2 font-medium text-gray-900 dark:text-white text-sm">
                    No database connected
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                    Connect to a database to start asking questions
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 shadow-sm mt-3 px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm"
                    onClick={onOpenConnectionModal}
                  >
                    Connect Database
                  </button>
                </div>
              </div>
            )}

            {messages.length === 0 && isDatabaseConnected && (
              <div className="flex justify-center items-center min-h-[calc(100%-80px)]">
                <div className="mx-auto p-6 max-w-sm text-center">
                  <svg
                    className="mx-auto w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <h3 className="mt-2 font-medium text-gray-900 dark:text-white text-sm">
                    Start a conversation
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                    Ask a question about your database to get started
                  </p>
                </div>
              </div>
            )}

            {/* Add top padding spacer to ensure first message is fully visible */}
            {messages.length > 0 && <div className="h-4" />}

            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || `msg-${index}-${String(message.timestamp)}`}
                message={message}
                currentSql={currentSql}
                currentResults={currentResults}
                currentVisualization={currentVisualization}
                isLastMessage={index === messages.length - 1}
              />
            ))}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-[80%] text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <div className="flex space-x-2 animate-pulse">
                      <div className="bg-gray-400 dark:bg-gray-500 rounded-full w-2 h-2"></div>
                      <div className="bg-gray-400 dark:bg-gray-500 rounded-full w-2 h-2"></div>
                      <div className="bg-gray-400 dark:bg-gray-500 rounded-full w-2 h-2"></div>
                    </div>
                    <span className="ml-2 text-sm">
                      {currentStatus || "Processing..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Message limit warning */}
            {showMessageLimitWarning && (
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 border-amber-400 dark:border-amber-600 border-l-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      This chat has reached the maximum message limit (
                      {ChatHistoryService.getMaxMessagesPerChat()} messages).
                      Please start a{" "}
                      <button
                        onClick={handleNewChat}
                        className="focus:outline-none font-medium underline"
                      >
                        new chat
                      </button>{" "}
                      to continue.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom padding spacer to ensure last message is fully visible */}
            <div className="h-4"></div>

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input area - fixed at bottom */}
          <div className="bottom-0 sticky bg-white dark:bg-gray-800 px-4 py-3 border-gray-200 dark:border-gray-700 border-t">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  !isDatabaseConnected
                    ? "Connect a database first..."
                    : showMessageLimitWarning
                    ? "Message limit reached. Start a new chat to continue."
                    : "Ask a question about your database..."
                }
                disabled={
                  !isDatabaseConnected ||
                  isProcessing ||
                  showMessageLimitWarning
                }
                className="flex-1 dark:bg-gray-700 shadow-sm p-2 border-gray-300 focus:border-indigo-500 dark:border-gray-600 rounded-l-md focus:ring-indigo-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={
                  !isDatabaseConnected ||
                  isProcessing ||
                  !input.trim() ||
                  showMessageLimitWarning
                }
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm px-4 py-2 border border-transparent rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-white text-sm"
              >
                <svg
                  className="mr-2 -ml-1 w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  transform="rotate(90)"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
