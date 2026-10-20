import api from "./axios";

// src/api/chatApi.ts
;

export interface ApiMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export interface ApiConversation {
  id: string;
  name: string;
  type: 'individual' | 'group';
  avatar?: string;
  role?: string;
  lastSeen?: string;
  memberIds?: string[];
  lastMessage?: {
    text: string;
    time: string;
    senderId: string;
    unread: boolean;
  };
  messages?: ApiMessage[];
}

export interface ConversationParams {
  search?: string;
  type?: string;
}

export const getConversations = async (
  params?: ConversationParams
): Promise<ApiConversation[]> => {
  const { data } = await api.get<ApiConversation[]>('/conversations', { params });
  return data;
};

export const getConversationById = async (
  id: string
): Promise<ApiConversation> => {
  const { data } = await api.get<ApiConversation>(`/conversations/${id}`);
  return data;
};