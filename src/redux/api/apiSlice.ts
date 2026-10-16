import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../slice/authSlice';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

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
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

/* ---- Employee auth types ---- */

interface LoginEmployeeArgs {
  employee_login_code: string; // confirm against Postman body
  password: string;
}

interface LoginEmployeeResponse {
  success: boolean;
  message: string;
  data: {
    requires_otp: boolean;
    challenge_id: string;
    employee_login_code: string;
    email: string; // masked
    expires_at: string;
    expires_in_seconds: number;
  };
}

interface VerifyOtpArgs {
  challenge_id: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

interface ResendOtpArgs {
  employee_login_code: string;
  password: string;
}

interface ResendOtpResponse {
  success: boolean;
  message: string;
  data: LoginEmployeeResponse['data'];
}

interface ForgotPasswordArgs {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Slice                                                              */
/* ------------------------------------------------------------------ */

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // .env: VITE_API_BASE_URL=http://localhost:3006  (no /api/v1 suffix)
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Employee'],
  endpoints: (builder) => ({
    /* -------- Generic login -------- */
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/api/v1/user/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              token: data.data.token,
              user: {
                ...data.data.user,
                id: data.data.user._id,
                name: data.data.user.Name,
              },
            }),
          );
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    /* -------- Employee login: step 1 -------- */
    loginEmployee: builder.mutation<LoginEmployeeResponse, LoginEmployeeArgs>({
      query: (body) => ({
        url: '/api/v1/user/login-employee',
        method: 'POST',
        body,
      }),
    }),

    /* -------- Employee login: step 2 -------- */
    verifyEmployeeOtp: builder.mutation<VerifyOtpResponse, VerifyOtpArgs>({
      query: (body) => ({
        url: '/api/v1/user/verify-employee-otp',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              token: data.data.token,
              user: {
                ...data.data.user,
                id: data.data.user._id,
                name: data.data.user.Name,
              },
            }),
          );
        } catch (error) {
          console.error('OTP verification failed:', error);
        }
      },
    }),

    /* -------- Employee login: resend OTP -------- */
    resendEmployeeOtp: builder.mutation<ResendOtpResponse, ResendOtpArgs>({
      query: (body) => ({
        url: '/api/v1/user/resend-employee-otp', // confirm path in Postman
        method: 'POST',
        body,
      }),
    }),

    /* -------- Forgot password: send OTP -------- */
    forgetPasswordSendOtp: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordArgs
    >({
      query: (body) => ({
        url: '/api/v1/user/forget-password/send-otp',
        method: 'POST',
        body,
      }),
    }),

    /* -------- Forgot password: resend OTP -------- */
    forgetPasswordResendOtp: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordArgs
    >({
      query: (body) => ({
        url: '/api/v1/user/forget-password/resend-otp',
        method: 'POST',
        body,
      }),
    }),

    /* -------- Fetch profile -------- */
    fetchUserProfile: builder.query<User, void>({
      query: () => '/api/v1/user/profile',
    }),

    /* -------- Logout -------- */
    logoutUser: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/api/v1/user/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginEmployeeMutation,
  useVerifyEmployeeOtpMutation,
  useResendEmployeeOtpMutation,
  useForgetPasswordSendOtpMutation,
  useForgetPasswordResendOtpMutation,
  useFetchUserProfileQuery,
  useLogoutUserMutation,
} = apiSlice;