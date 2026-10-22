// src/api/chatApi.ts
import api from "./axios";

export interface ApiMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export interface ApiConversation {
  _id: string;
  chat_conversation_id: number;
  title: string;
  type: "individual" | "group";
  unread_count: number;
  last_message?: {
    chat_message_id: number;
    message: string;
    sender_id: number;
    sender_name: string;
    sent_at: string;
  };
  participants?: Array<{
    participant_id: number;
    name: string;
    role: string;
  }>;
}

export interface ConversationParams {
  search?: string;
  type?: string;
}
/**
 * GET /restaurant/chat/conversations/getall
 * Owner token → all conversations. Employee token → only their own.
 */
export const getConversations = async (
  params?: ConversationParams
): Promise<ApiConversation[]> => {
  const { data } = await api.get<{ data: ApiConversation[] } | ApiConversation[]>(
    "/api/v1/restaurant/chat/conversations/getall",
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
    `/api/v1/restaurant/chat/conversations/${id}`
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
    `/api/v1/restaurant/chat/conversations/${conversationId}/messages`,
    { text }
  );
  return "data" in (data as object) && !Array.isArray(data)
    ? (data as { data: ApiMessage }).data
    : (data as ApiMessage);
};