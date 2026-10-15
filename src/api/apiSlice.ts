import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/redux/store';

export interface LoginEmployeeRequest {
  email: string;
  password: string;
}

export interface LoginEmployeeResponse {
  success: boolean;
  message: string;
  data: {
    requires_otp: boolean;
    challenge_id: string;
    employee_login_code: string;
    email: string;
    expires_at: string;
    expires_in_seconds: number;
  };
}

export interface VerifyOtpRequest {
  challenge_id: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
      role?: string;
      [key: string]: any;
    };
  };
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    loginEmployee: builder.mutation<LoginEmployeeResponse, LoginEmployeeRequest>({
      query: (body) => ({
        url: '/api/v1/user/login-employee',
        method: 'POST',
        body,
      }),
    }),

    verifyEmployeeOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: '/api/v1/user/verify-employee-otp',
        method: 'POST',
        body,
      }),
    }),

    resendEmployeeOtp: builder.mutation<LoginEmployeeResponse, LoginEmployeeRequest>({
      query: (body) => ({
        url: '/api/v1/user/login-employee',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<
      { success: boolean; data: { token: string; user: any } },
      LoginEmployeeRequest
    >({
      query: (body) => ({
        url: '/api/v1/user/login',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginEmployeeMutation,
  useVerifyEmployeeOtpMutation,
  useResendEmployeeOtpMutation,
} = apiSlice;