// src/redux/slice/chatSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getConversations, getConversationById, sendMessage as sendMessageApi,
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
    try { return await getConversationById(id); }
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
      
      // If it belongs to the open chat, append (dedupe by id)
      if (state.activeChatId && (msg as any).conversationId === state.activeChatId) {
        if (!state.messages.some((m) => m.id === msg.id)) {
          state.messages.push(msg);
        }
      }

      // Update conversation list preview + unread flag
      const conv = state.conversations.find((c) => c.id === (msg as any).conversationId);
      if (conv) {
        conv.lastMessage = {
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderId: msg.senderId,
          unread: state.activeChatId !== conv.id,
        };
        // Move this conversation to the top
        state.conversations = [conv, ...state.conversations.filter((c) => c.id !== conv.id)];
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
      .addCase(fetchConversations.fulfilled, (s, a) => { s.loadingList = false; s.conversations = a.payload; })
      .addCase(fetchConversations.rejected, (s, a) => { s.loadingList = false; s.error = (a.payload as string) ?? "Error"; })

      .addCase(fetchChatDetails.pending, (s) => { s.loadingChat = true; s.error = null; })
      .addCase(fetchChatDetails.fulfilled, (s, a) => {
        s.loadingChat = false;
        s.activeChatId = a.payload.id;
        s.messages = a.payload.messages ?? [];
      })
      .addCase(fetchChatDetails.rejected, (s, a) => { s.loadingChat = false; s.error = (a.payload as string) ?? "Error"; })

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