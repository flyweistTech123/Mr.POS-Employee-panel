// src/redux/slice/chatSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getConversations, getConversationById, getMessages,
  sendMessage as sendMessageApi,
  type ApiConversation, type ApiMessage, type ConversationParams,
} from "@/api/chatApi";

interface ChatState {
  conversations: ApiConversation[];
  messages: ApiMessage[];
  activeChatId: string | null;
  loadingList: boolean;
  loadingChat: boolean;
  sendingMessage: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  activeChatId: null,
  loadingList: false,
  loadingChat: false,
  sendingMessage: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (params: ConversationParams | undefined, { rejectWithValue }) => {
    try { return await getConversations(params); }
    catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Failed to load conversations");
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  "chat/fetchChatDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const [conversation, messages] = await Promise.all([
        getConversationById(id),
        getMessages(id).catch(() => [] as ApiMessage[]),
      ]);
      return { conversation, messages };
    }
    catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Failed to load chat");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { conversationId, text }: { conversationId: string; text: string },
    { rejectWithValue }
  ) => {
    try { return await sendMessageApi(conversationId, text); }
    catch (e: any) { return rejectWithValue(e?.response?.data?.message ?? "Failed to send message"); }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearActiveChat: (state) => {
      state.activeChatId = null;
      state.messages = [];
    },
    receiveMessage: (state, action: PayloadAction<ApiMessage & { conversationId?: string }>) => {
      const msg = action.payload;
      const convId = msg.conversationId;

      if (state.activeChatId && convId && String(convId) === state.activeChatId) {
        if (!state.messages.some((m) => m.id === msg.id)) {
          state.messages.push(msg);
        }
      }

      const conv = state.conversations.find(
        (c) => String(c.chat_conversation_id) === String(convId)
      );
      
      if (conv) {
        // Enforce that message is a string
        const safeText = typeof msg.text === "string" ? msg.text : "";
        
        conv.last_message = {
          chat_message_id: Number(msg.id) || 0,
          message: safeText,
          message_type: "text",
          sender_type: "employee",
          sender_id: Number(msg.senderId) || 0,
          sender_name: "",
          sent_at: msg.createdAt || new Date().toISOString(),
        } as any;
        
        if (state.activeChatId !== String(convId)) {
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
        state.conversations = [conv, ...state.conversations.filter((c) => c !== conv)];
      }
    },
    setSendingMessage: (state, action: PayloadAction<boolean>) => {
      state.sendingMessage = action.payload;
    },
    appendOptimisticMessage: (state, action: PayloadAction<ApiMessage>) => {
      state.messages.push(action.payload);
    },
    confirmMessage: (
      state,
      action: PayloadAction<{ clientId: string; message: ApiMessage }>
    ) => {
      const idx = state.messages.findIndex((m) => m.id === action.payload.clientId);
      if (idx !== -1) state.messages[idx] = action.payload.message;
      else if (!state.messages.some((m) => m.id === action.payload.message.id)) {
        state.messages.push(action.payload.message);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (s) => { s.loadingList = true; s.error = null; })
      .addCase(fetchConversations.fulfilled, (s, a) => {
        s.loadingList = false;
        s.conversations = a.payload as unknown as ApiConversation[];
      })
      .addCase(fetchConversations.rejected, (s, a) => {
        s.loadingList = false;
        s.error = (a.payload as string) ?? "Error";
      })

      .addCase(fetchChatDetails.pending, (s) => { s.loadingChat = true; s.error = null; })
      .addCase(fetchChatDetails.fulfilled, (s, a) => {
        s.loadingChat = false;
        const { conversation, messages } = a.payload;
        s.activeChatId = String(conversation.chat_conversation_id);
        s.messages = messages;
      })
      .addCase(fetchChatDetails.rejected, (s, a) => {
        s.loadingChat = false;
        s.error = (a.payload as string) ?? "Error";
      })

      .addCase(sendMessage.pending, (s) => { s.sendingMessage = true; })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.sendingMessage = false;
        if (!s.messages.some((m) => m.id === a.payload.id)) s.messages.push(a.payload);
      })
      .addCase(sendMessage.rejected, (s) => { s.sendingMessage = false; });
  },
});

export const {
  clearActiveChat, receiveMessage, appendOptimisticMessage, confirmMessage, setSendingMessage,
} = chatSlice.actions;
export default chatSlice.reducer;