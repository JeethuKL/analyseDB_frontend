import { ChatMessage, ChatSession } from "@/types";

const STORAGE_KEY = "chatSessions";
const MAX_MESSAGES_PER_CHAT = 6;
const MAX_SESSIONS = 10;

export const ChatHistoryService = {
  /**
   * Get all chat sessions from local storage
   */
  getAllSessions(): ChatSession[] {
    if (typeof window === "undefined") return [];

    try {
      const sessions = localStorage.getItem(STORAGE_KEY);
      const parsedSessions = sessions ? JSON.parse(sessions) : [];

      // Process timestamps in messages to ensure they're Date objects
      return parsedSessions.map((session: ChatSession) => ({
        ...session,
        messages: session.messages.map((msg) => ({
          ...msg,
          // Ensure timestamp is a Date object for consistency
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        })),
      }));
    } catch (error) {
      console.error("Error getting chat sessions:", error);
      return [];
    }
  },

  /**
   * Get a specific chat session by ID
   */
  getSessionById(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find((session) => session.id === sessionId) || null;
  },

  /**
   * Create a new chat session
   */
  createSession(title: string = "New Chat"): ChatSession {
    const sessions = this.getAllSessions();

    // Create a new session
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      messages: [],
    };

    // Add the new session to the beginning of the list
    const updatedSessions = [newSession, ...sessions];

    // Limit the number of sessions
    if (updatedSessions.length > MAX_SESSIONS) {
      updatedSessions.pop();
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));

    return newSession;
  },

  /**
   * Add a message to a specific session
   */
  addMessage(sessionId: string, message: ChatMessage): boolean {
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex === -1) return false;

    // Check if this session has reached the message limit
    if (sessions[sessionIndex].messages.length >= MAX_MESSAGES_PER_CHAT) {
      return false;
    }

    // Add the message
    sessions[sessionIndex].messages.push(message);

    // Update the session title if it's the first user message
    if (
      message.role === "user" &&
      sessions[sessionIndex].messages.length === 1
    ) {
      sessions[sessionIndex].title =
        message.content.substring(0, 30) +
        (message.content.length > 30 ? "..." : "");
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

    return true;
  },

  /**
   * Add a new chat session
   */
  addSession(session: ChatSession): void {
    if (typeof window === "undefined") return;

    // Don't save sessions without any user messages
    if (
      !session.messages ||
      session.messages.length === 0 ||
      !session.messages.some(
        (msg) => msg.role === "user" && msg.content && msg.content.trim() !== ""
      )
    ) {
      return;
    }

    try {
      const sessions = this.getAllSessions();
      sessions.unshift(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving chat session:", error);
    }
  },

  /**
   * Save updates to a specific chat session
   */
  saveSession(sessionId: string, updates: Partial<ChatSession>): void {
    if (typeof window === "undefined") return;

    try {
      const sessions = this.getAllSessions();
      const index = sessions.findIndex((s) => s.id === sessionId);

      if (index !== -1) {
        const updatedSession = { ...sessions[index], ...updates };

        // Don't save sessions without any user messages
        const hasUserMessages = updatedSession.messages?.some(
          (msg) =>
            msg.role === "user" && msg.content && msg.content.trim() !== ""
        );

        if (!hasUserMessages) {
          // If the session has no meaningful user messages, consider removing it
          sessions.splice(index, 1);
        } else {
          sessions[index] = updatedSession;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error("Error saving chat session:", error);
    }
  },

  /**
   * Delete a chat session
   */
  deleteSession(sessionId: string): boolean {
    const sessions = this.getAllSessions();
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);

    if (updatedSessions.length === sessions.length) {
      return false; // Session not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    return true;
  },

  /**
   * Clear all chat sessions
   */
  clearAllSessions(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Check if a session has reached the maximum message limit
   */
  hasReachedMessageLimit(sessionId: string): boolean {
    const session = this.getSessionById(sessionId);
    return session ? session.messages.length >= MAX_MESSAGES_PER_CHAT : false;
  },

  /**
   * Get the maximum messages allowed per chat
   */
  getMaxMessagesPerChat(): number {
    return MAX_MESSAGES_PER_CHAT;
  },
};
