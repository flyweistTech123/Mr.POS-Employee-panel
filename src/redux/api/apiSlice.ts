import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../slice/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  _id: string;
  Name: string;
  Employee_id: string;
  email: string;
  phone: string;
  gender: string;
  user_image: string;
  OnboardingDate: string;
  yearsWithus: number;
  isLoginPermission: boolean;
  Status: boolean;
  user_id: number;
  // Add other fields as needed
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/api/user/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({
            token: data.data.token,
            user: {
              ...data.data.user,
              id: data.data.user._id,
              name: data.data.user.Name,
            },
          }));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    fetchUserProfile: builder.query<User, void>({
      query: () => '/api/user/profile', // Adjust endpoint as needed
    }),
  }),
});

export const { useLoginMutation, useFetchUserProfileQuery } = apiSlice;