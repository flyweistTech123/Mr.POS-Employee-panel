// src/redux/slice/chatSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  getConversations, 
  getConversationById, 
  type ApiConversation, 
  type ApiMessage 
} from '@/api/chatApi'; // Or relative path depending on your structure

interface ChatState {
  conversations: ApiConversation[];
  activeConversation: ApiConversation | null;
  messages: ApiMessage[];
  loadingList: boolean;
  loadingChat: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loadingList: false,
  loadingChat: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (params: { search?: string; type?: string } | undefined, { rejectWithValue }) => {
    try {
      return await getConversations(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  'chat/fetchChatDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      return await getConversationById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat details');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearActiveChat: (state) => {
      state.activeConversation = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchConversations.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<ApiConversation[]>) => {
        state.loadingList = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload as string;
      })
      // Fetch Details
      .addCase(fetchChatDetails.pending, (state) => {
        state.loadingChat = true;
        state.error = null;
      })
      .addCase(fetchChatDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.loadingChat = false;
        state.activeConversation = action.payload;
        state.messages = action.payload.messages || []; 
      })
      .addCase(fetchChatDetails.rejected, (state, action) => {
        state.loadingChat = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearActiveChat } = chatSlice.actions;
export default chatSlice.reducer;