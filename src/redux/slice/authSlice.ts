import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Initial state                                                      */
/* ------------------------------------------------------------------ */

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

/* ------------------------------------------------------------------ */
/* Slice                                                              */
/* ------------------------------------------------------------------ */

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
      // redux-persist handles persistence via the store's persistConfig
    },

    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },

    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;