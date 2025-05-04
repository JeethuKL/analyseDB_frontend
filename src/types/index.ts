export interface User {
  id: number | string;
  username: string;
  email: string;
  created_at: string;
  profile_image?: string;
}

export interface SchemaResponse {
  tables: any[];
  success: boolean;
  message: string;
  table_count: number;
  timestamp: string;
}

// Update your ChatMessage type

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date | string;
  type?:
    | "text"
    | "error"
    | "results"
    | "status"
    | "correction"
    | "empty_results"
    | "clarification";

  // Add these fields to store data with the message
  visualization?: VisualizationData;
  results?: QueryResult;
  sql?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  [key: string]: any; // Allow for additional properties
}

export interface VisualizationData {
  type: string;
  plotly_code: string;
  [key: string]: any; // Allow for additional properties
}

export interface ConnectionStatus {
  success: boolean;
  message: string;
  tableCount?: number;
}
