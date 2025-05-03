import { useEffect, useState } from 'react';
import { ChatSession } from '@/types';
import { ChatHistoryService } from '@/services/chatHistory';

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const ChatSidebar = ({ 
  currentSessionId, 
  onSessionSelect,
  onNewChat,
  mobileOpen,
  onCloseMobile
}: ChatSidebarProps) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load chat sessions from local storage
  useEffect(() => {
    setChatSessions(ChatHistoryService.getAllSessions());
  }, [currentSessionId]); // Refresh when current session changes

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      ChatHistoryService.deleteSession(sessionId);
      setChatSessions(ChatHistoryService.getAllSessions());
      
      // If the deleted session is the current one, create a new chat
      if (sessionId === currentSessionId) {
        onNewChat();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If the chat is from today, show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`fixed md:static inset-0 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:relative z-30`}>
      <div className="bg-white dark:bg-gray-800 shadow h-full md:h-[calc(100vh-7rem)] flex flex-col rounded-lg overflow-hidden">
        {/* Mobile close button */}
        <div className="md:hidden p-2 flex justify-end">
          <button 
            onClick={onCloseMobile}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* New Chat button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onNewChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Chat
          </button>
        </div>
        
        {/* Chat history list */}
        <div className="flex-1 overflow-y-auto p-2">
          {chatSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No chat history yet</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {chatSessions.map(session => (
                <li key={session.id}>
                  {/* Changed from button to div with onClick */}
                  <div
                    onClick={() => onSessionSelect(session)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex justify-between group cursor-pointer ${
                      currentSessionId === session.id 
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center overflow-hidden">
                      <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                        {formatDate(session.createdAt)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                        aria-label="Delete chat"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};