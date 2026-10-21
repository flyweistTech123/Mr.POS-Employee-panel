// src/api/chatApi.ts
import api from "./axios";

export interface ApiMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export interface ApiConversation {
  id: string;
  name: string;
  type: "individual" | "group";
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
  type?: string; // "waiter" | "chef" | "manager" (singular)
}

/**
 * GET /restaurant/chat/conversations/getall
 * Owner token → all conversations. Employee token → only their own.
 */
export const getConversations = async (
  params?: ConversationParams
): Promise<ApiConversation[]> => {
  const { data } = await api.get<{ data: ApiConversation[] } | ApiConversation[]>(
    "/restaurant/chat/conversations/getall",
    { params }
  );
  // Support either { data: [...] } or raw [...] envelope
  return Array.isArray(data) ? data : data.data;
};

/**
 * GET /restaurant/chat/conversations/:id
 * Adjust the path if the backend uses `/get/:id` or `/getbyid/:id`.
 */
export const getConversationById = async (
  id: string
): Promise<ApiConversation> => {
  const { data } = await api.get<{ data: ApiConversation } | ApiConversation>(
    `/restaurant/chat/conversations/${id}`
  );
  return "data" in (data as object) && !Array.isArray(data)
    ? (data as { data: ApiConversation }).data
    : (data as ApiConversation);
};

/** POST /restaurant/chat/conversations/:id/messages — adjust path if needed */
export const sendMessage = async (
  conversationId: string,
  text: string
): Promise<ApiMessage> => {
  const { data } = await api.post<{ data: ApiMessage } | ApiMessage>(
    `/restaurant/chat/conversations/${conversationId}/messages`,
    { text }
  );
  return "data" in (data as object) && !Array.isArray(data)
    ? (data as { data: ApiMessage }).data
    : (data as ApiMessage);
};