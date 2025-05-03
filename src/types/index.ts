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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: string;
  timestamp: Date | string;
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
}

export interface VisualizationData {
  type: string;
  plotly_code: string;
}

export interface ConnectionStatus {
  success: boolean;
  message: string;
  tableCount?: number;
}
