// src/redux/slice/chatSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  activeChatId: null,
  loadingList: false,
  loadingChat: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (params: ConversationParams | undefined, { rejectWithValue }) => {
    try {
      return await getConversations(params);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? e?.message ?? "Failed to load conversations"
      );
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  "chat/fetchChatDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getConversationById(id);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? e?.message ?? "Failed to load chat"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { conversationId, text }: { conversationId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      return await sendMessageApi(conversationId, text);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? "Failed to send message");
    }
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (s) => {
        s.loadingList = true; s.error = null;
      })
      .addCase(fetchConversations.fulfilled, (s, a) => {
        s.loadingList = false; s.conversations = a.payload;
      })
      .addCase(fetchConversations.rejected, (s, a) => {
        s.loadingList = false; s.error = (a.payload as string) ?? "Error";
      })
      .addCase(fetchChatDetails.pending, (s) => {
        s.loadingChat = true; s.error = null;
      })
      .addCase(fetchChatDetails.fulfilled, (s, a) => {
        s.loadingChat = false;
        s.activeChatId = a.payload.id;
        s.messages = a.payload.messages ?? [];
      })
      .addCase(fetchChatDetails.rejected, (s, a) => {
        s.loadingChat = false; s.error = (a.payload as string) ?? "Error";
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.messages.push(a.payload);
      });
  },
});

export const { clearActiveChat } = chatSlice.actions;
export default chatSlice.reducer;