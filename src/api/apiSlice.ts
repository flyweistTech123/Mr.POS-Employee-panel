import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../redux/slice/authSlice';

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

interface LoginEmployeeArgs {
  employee_login_code: string;
  password: string;
}

interface LoginEmployeeResponse {
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

/* ------------------------------------------------------------------ */
/* Dashboard & Attendance Types                                       */
/* ------------------------------------------------------------------ */

export interface EmployeePerformanceResponse {
  success: boolean;
  message: string;
  data: {
    employeeDetails: {
      Name: string;
      image: string | null;
      role: string;
      clockin: string | null;
      WorkedToday: number;
      MinsBreak: number;
      LeavesLeft: number;
    };
    AvgWorkingHrs: { day: string; serving: number; helping: number }[];
    totalTipsEarned: {
      totalTips: number;
      currency: string;
      avgTipMin: number;
      avgTipMax: number;
      period: string;
      percentage: number;
    };
    feedbacks: any[];
    overallFeedback: {
      lovedIt: number;
      good: number;
      average: number;
      bad: number;
      worst: number;
    };
    staffBehavior: string;
    waitingTime: string;
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: {
    TotalOrders: number;
    TotalSales: number;
    NewCustomers: number;
    RepeatCustomers: number;
    TopSellers: any[];
    StockAlerts: any[];
  };
}

export interface RestaurantDashboardResponse {
  success: boolean;
  message: string;
  data: {
    TotalOrder: number;
    TotalSale: number;
    RepeatCustomersChart: { percentage: number[]; Days: string[] };
    NewCustomersChart: { percentage: number[]; Days: string[] };
    ReservationsOrderList: any[];
    TopSellersItemList: any[];
    StockAlertList: any[];
    filter: string;
    dateRange: { start: string; end: string };
  };
}

/* ------------------------------------------------------------------ */
/* Slice                                                              */
/* ------------------------------------------------------------------ */

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // .env: VITE_API_BASE_URL=https://pos-backend-7xuw.onrender.com
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Employee', 'ChatList', 'ChatDetails', 'Dashboard','Reservations'],
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

    /* -------- Employee login: step 1 (request OTP) -------- */
    loginEmployee: builder.mutation<LoginEmployeeResponse, LoginEmployeeArgs>({
      query: (body) => ({
        url: '/api/v1/user/login-employee',
        method: 'POST',
        body,
      }),
    }),

    /* -------- Employee login: step 2 (verify OTP) -------- */
    verifyEmployeeOtp: builder.mutation<VerifyOtpResponse, VerifyOtpArgs>({
      query: (body) => ({
        url: '/api/v1/user/login-employee/verify-otp',
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
        url: '/api/v1/user/login-employee/resend-otp',
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

    /* ------------------------------------------------------------------ */
    /* REPORTING & DASHBOARD ENDPOINTS                                    */
    /* ------------------------------------------------------------------ */

    /* -------- Employee Performance (Attendance Page) -------- */
    getEmployeePerformance: builder.query<EmployeePerformanceResponse, string | number>({
      query: (employeeId) => `/api/v1/restaurant/reports/employee-performance/${employeeId}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),

    /* -------- Dashboard Stats (Sale Page - File 2) -------- */
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => '/api/v1/restaurant/reports/dashboard',
      providesTags: ['Dashboard'],
    }),

    /* -------- Restaurant Dashboard (Sale Page - File 1) -------- */
    getRestaurantDashboard: builder.query<RestaurantDashboardResponse, { filter: string }>({
      query: ({ filter }) => `/api/v1/restaurant/reports/restaurant-dashboard?filter=${filter}`,
      providesTags: ['Dashboard'],
    }),
  }),
});

/* ------------------------------------------------------------------ */
/* Exports                                                            */
/* ------------------------------------------------------------------ */

export const {
  useLoginMutation,
  useLoginEmployeeMutation,
  useVerifyEmployeeOtpMutation,
  useResendEmployeeOtpMutation,
  useForgetPasswordSendOtpMutation,
  useForgetPasswordResendOtpMutation,
  useFetchUserProfileQuery,
  
  // Newly added hooks:
  useGetEmployeePerformanceQuery,
  useGetDashboardStatsQuery,
  useGetRestaurantDashboardQuery,
} = apiSlice;