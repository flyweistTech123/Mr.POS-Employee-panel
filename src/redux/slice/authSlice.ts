import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    // ✅ Full reset
    logout: () => initialState,
  },
});

export const { setCredentials, setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;