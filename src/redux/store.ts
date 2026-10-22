// src/redux/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';

import { apiSlice } from './api/apiSlice';
import authReducer from './slice/authSlice';
import { orderHistoryApi } from './api/orderHistoryApi';
import { quickOrderApi } from './api/quickOrderSlice';
import { userApi } from './api/userApi';
import chatReducer from './slice/chatSlice';
import { floorPlanApi } from '@/redux/api/floorPlanApi';
// 👇 Side-effect import: runs the file to inject endpoints into apiSlice,
// but does NOT import the settingsApi variable itself.
import './api/settingsApi';

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [orderHistoryApi.reducerPath]: orderHistoryApi.reducer,
  [quickOrderApi.reducerPath]: quickOrderApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
   [floorPlanApi.reducerPath]: floorPlanApi.reducer,
  auth: authReducer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      apiSlice.middleware,
      orderHistoryApi.middleware,
      quickOrderApi.middleware,
      userApi.middleware,
       floorPlanApi.middleware,
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;