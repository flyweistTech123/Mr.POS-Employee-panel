// src/api/chatApi.ts
import axios from './axios'; 

export interface ApiMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  readBy: string[];
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
}

export const getConversations = async (params?: { search?: string; type?: string }) => {
  // ✅ Added the /api/v1/restaurant path
  const response = await axios.get('/api/v1/restaurant/chat/conversations/getall', { params });
  return response.data.data; 
};

export const getConversationById = async (id: string) => {
  // ✅ Added the /api/v1/restaurant path
  const response = await axios.get(`/api/v1/restaurant/chat/conversations/getbyid/${id}`);
  return response.data.data;
};