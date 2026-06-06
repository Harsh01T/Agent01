export type Role = 'user' | 'ai';


export interface Message {
  id: string;          // UUID v4
  conversationId: string; // Foreign key linking to the parent conversation
  sender: Role;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;          // UUID v4 acts as the sessionId
  createdAt: Date;
  metadata?: string;
}


export interface ChatRequestPayload {
  message: string;
  sessionId?: string;
}

export interface ChatResponsePayload {
  reply: string;
  sessionId: string;   // Always returned so the frontend can lock onto this session
}
