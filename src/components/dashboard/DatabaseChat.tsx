import { useState, useRef, useEffect } from 'react';
import { User, ChatMessage as ChatMessageType, QueryResult, VisualizationData, ChatSession } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatSidebar } from './ChatSidebar';
import { ChatHistoryService } from '@/services/chatHistory';

interface DatabaseChatProps {
  user: User | null;
  isDatabaseConnected: boolean;
  onOpenConnectionModal: () => void;
}

export const DatabaseChat = ({ user, isDatabaseConnected, onOpenConnectionModal }: DatabaseChatProps) => {
  // Chat related states
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSql, setCurrentSql] = useState<string | null>(null);
  const [currentResults, setCurrentResults] = useState<QueryResult | null>(null);
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationData | null>(null);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if the current session has reached the message limit
  const checkMessageLimit = (session?: ChatSession | null) => {
    const currentSession = session || (currentSessionId ? ChatHistoryService.getSessionById(currentSessionId) : null);

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
      .find(msg => msg.role === 'assistant' && (
        msg.results || msg.visualization || msg.sql || msg.type === 'results'
      ));
    
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
    setShowMessageLimitWarning(ChatHistoryService.hasReachedMessageLimit(session.id));
  };

  // Reset chat UI state
  const resetChatState = () => {
    setInput('');
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
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Please connect to a database first before asking questions.',
          timestamp: new Date(),
          type: 'error'
        }
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
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add to UI and save to localStorage
    setMessages(prev => [...prev, userMessage]);
    ChatHistoryService.addMessage(currentSessionId, userMessage);

    setInput('');
    setIsProcessing(true);

    // Reset current response elements
    setCurrentSql(null);
    setCurrentResults(null);
    setCurrentVisualization(null);
    setCurrentStatus('Processing your query...');

    try {
      // Get previous context - last 5 messages maximum
      const previousContext = messages
        .slice(-5) // Take up to 5 previous messages for context
        .map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: String(user?.id),
          previous_messages: previousContext // Add previous messages for context
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

      // Create initial response message
      let responseMessage: ChatMessageType = {
        id: `assistant-msg-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      // Add empty message that will be updated as we stream
      setMessages(prev => [...prev, responseMessage]);
      ChatHistoryService.addMessage(currentSessionId, responseMessage);

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            switch(data.type) {
              case 'message':
                responseMessage.content += data.data || '';
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].id === responseMessage.id) {
                    updated[lastIndex] = { ...updated[lastIndex], content: responseMessage.content };
                  }
                  return updated;
                });
                
                // Update the message content in storage for each significant chunk
                // This ensures the complete response is saved
                ChatHistoryService.updateMessageContent(
                  currentSessionId,
                  responseMessage.id,
                  responseMessage.content
                );
                break;
                
              case 'sql':
                setCurrentSql(data.data);
                setCurrentStatus('Executing SQL query...');
                
                // Save the SQL with the message
                ChatHistoryService.updateMessageWithVisualization(
                  currentSessionId,
                  responseMessage.id,
                  currentVisualization,
                  currentResults,
                  data.data, // SQL
                  responseMessage.content // Current content
                );
                break;
                
              case 'results':
                try {
                  const results: QueryResult = data.data;
                  setCurrentResults(results);
                  
                  // Update message with results and type
                  responseMessage.type = 'results';
                  
                  // Add formatted results text to the response
                  if (results && results.rows) {
                    const resultsText = generateResultsText(results);
                    responseMessage.content += `\n\n${resultsText}`;
                    
                    setMessages(prev => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;
                      if (lastIndex >= 0 && updated[lastIndex].id === responseMessage.id) {
                        updated[lastIndex] = { 
                          ...updated[lastIndex], 
                          content: responseMessage.content,
                          type: 'results'
                        };
                      }
                      return updated;
                    });
                  }
                  
                  // Save complete message with SQL, results, and current content
                  ChatHistoryService.updateMessageWithVisualization(
                    currentSessionId,
                    responseMessage.id,
                    currentVisualization,
                    results,
                    currentSql,
                    responseMessage.content
                  );
                } catch (error) {
                  console.error('Error processing results:', error);
                }
                break;
                
              case 'visualization':
                try {
                  if (data.data && typeof data.data === 'object') {
                    const vizType = data.data.type || 'bar';
                    const plotlyCode = data.data.plotly_code || '';
      
                    const vizData = {
                      type: vizType,
                      plotly_code: plotlyCode
                    };
                    
                    setCurrentVisualization(vizData);
                    
                    // Add visualization description to message content
                    responseMessage.content += `\n\nI've created a ${vizType} chart to visualize this data.`;
                    
                    setMessages(prev => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;
                      if (lastIndex >= 0 && updated[lastIndex].id === responseMessage.id) {
                        updated[lastIndex] = { 
                          ...updated[lastIndex], 
                          content: responseMessage.content
                        };
                      }
                      return updated;
                    });
                    
                    // Save all data with the message
                    ChatHistoryService.updateMessageWithVisualization(
                      currentSessionId,
                      responseMessage.id,
                      vizData,
                      currentResults,
                      currentSql,
                      responseMessage.content
                    );
                  }
                } catch (error) {
                  console.error('Error processing visualization data:', error);
                }
                break;
                
              // ...other cases...
            }
          } catch (error) {
            console.error('Error parsing line:', line, error);
          }
        }
      }

      // Final update to ensure everything is saved
      ChatHistoryService.updateMessageWithVisualization(
        currentSessionId,
        responseMessage.id,
        currentVisualization,
        currentResults,
        currentSql,
        responseMessage.content
      );

    } catch (error) {
      console.error('Query streaming failed:', error);

      const errorMessage: ChatMessageType = {
        id: `error-msg-${Date.now()}`,
        role: 'assistant',
        content: `Error processing your query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      ChatHistoryService.addMessage(currentSessionId, errorMessage);

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

  // Add a method to add welcome message when database is connected
  const addWelcomeMessage = (tableCount: number) => {
    const welcomeMessage: ChatMessageType = {
      id: `welcome-msg-${Date.now()}`,
      role: 'assistant',
      content: `Database connected successfully! Found ${tableCount} tables. You can now ask questions about your data.`,
      timestamp: new Date(),
      type: 'status'
    };

    setMessages([welcomeMessage]);

    if (currentSessionId) {
      ChatHistoryService.addMessage(currentSessionId, welcomeMessage);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10 sticky top-0">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Database Chat
          </h3>
          <div className="mt-1 flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDatabaseConnected ? 'Connected to database' : 'Not connected to database'}
              {!isDatabaseConnected && (
                <button
                  onClick={onOpenConnectionModal}
                  className="ml-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
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
            className="hidden md:flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Chat
          </button>
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat sidebar with history - now with sticky positioning */}
        <div className="w-64 shrink-0 hidden md:block border-r border-gray-200 dark:border-gray-700 overflow-hidden">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages area - added min-height and improved padding */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-pt-4">
            {messages.length === 0 && !isDatabaseConnected && (
              <div className="flex items-center justify-center min-h-[calc(100%-80px)]">
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
                    onClick={onOpenConnectionModal}
                  >
                    Connect Database
                  </button>
                </div>
              </div>
            )}

            {messages.length === 0 && isDatabaseConnected && (
              <div className="flex items-center justify-center min-h-[calc(100%-80px)]">
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

            {/* Message limit warning */}
            {showMessageLimitWarning && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 dark:bg-amber-900/30 dark:border-amber-600">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This chat has reached the maximum message limit ({ChatHistoryService.getMaxMessagesPerChat()} messages).
                      Please start a <button
                        onClick={handleNewChat}
                        className="underline font-medium focus:outline-none"
                      >
                        new chat
                      </button> to continue.
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
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 sticky bottom-0">
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
                disabled={!isDatabaseConnected || isProcessing || showMessageLimitWarning}
                className="flex-1 p-2 rounded-l-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={!isDatabaseConnected || isProcessing || !input.trim() || showMessageLimitWarning}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" transform="rotate(90)">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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