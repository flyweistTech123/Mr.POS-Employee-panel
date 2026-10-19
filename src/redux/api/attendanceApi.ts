import { apiSlice } from './apiSlice';

// ---------- Types ----------
export interface EmergencyContact {
  enabled: boolean;
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface EmployeeProfile {
  _id: string;
  id: string;
  employee_id: number;
  employee_id_code: string;
  employee_login_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  responsibility: string;
  shift_timings: string;
  profile_image: string;
  onboarding_date: string;
  experience_years: number;
  total_leave_days: number;
  leave_left_days: number;
  emergency_contact: EmergencyContact;
  recovery_email: string | null;
  Status: boolean;
}

export interface AttendanceRecord {
  _id: string;
  employee_id: number;
  clock_in?: string;
  clock_out?: string;
  date?: string;
  total_hours?: string;
  overtime?: string;
  status?: 'present' | 'absent' | 'late';
  breaks?: Array<{
    break_type: string;
    note?: string;
    start?: string;
    end?: string;
  }>;
  [key: string]: any;
}

export interface LeaveRequest {
  _id: string;
  leave_request_id: number;
  restaurant_id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  leave_time: 'full_day' | 'half_day' | string;
  attachment_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  manager_note: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  CreateAt: string;
  UpdatedAt: string;
}

interface DashboardResponse {
  success: boolean;
  data: {
    employee: EmployeeProfile;
    current_attendance: AttendanceRecord | null;
    leave_balance: number;
    leave_requests: LeaveRequest[];
  };
}

interface HistoryResponse {
  success: boolean;
  count: number;
  data: AttendanceRecord[];
}

interface LeaveListResponse {
  success: boolean;
  count: number;
  data: LeaveRequest[];
}

interface LeaveCreateArgs {
  leave_type: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason: string;
  leave_time: 'full_day' | 'half_day';
  attachment_url?: string;
}

interface BreakStartArgs {
  break_type: string;
  note?: string;
}

interface EmergencyContactArgs {
  enabled: boolean;
  name?: string;
  phone?: string;
  email?: string;
}

interface ReviewLeaveArgs {
  leaveRequestId: string | number;
  status: 'approved' | 'rejected';
  manager_note?: string;
}

// ---------- Endpoints ----------
export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Main dashboard
    getAttendanceDashboard: builder.query<DashboardResponse, void>({
      query: () => '/api/v1/employee/attendance/dashboard',
      providesTags: ['AttendanceDashboard'],
    }),

    // Clock in / out
    clockIn: builder.mutation<{ success: boolean; data: AttendanceRecord }, void>({
      query: () => ({
        url: '/api/v1/employee/attendance/clock-in',
        method: 'POST',
      }),
      invalidatesTags: ['AttendanceDashboard', 'AttendanceHistory'],
    }),

    clockOut: builder.mutation<{ success: boolean; data: AttendanceRecord }, void>({
      query: () => ({
        url: '/api/v1/employee/attendance/clock-out',
        method: 'POST',
      }),
      invalidatesTags: ['AttendanceDashboard', 'AttendanceHistory'],
    }),

    // Breaks
    startBreak: builder.mutation<any, BreakStartArgs>({
      query: (body) => ({
        url: '/api/v1/employee/attendance/break/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AttendanceDashboard'],
    }),

    endBreak: builder.mutation<any, void>({
      query: () => ({
        url: '/api/v1/employee/attendance/break/end',
        method: 'POST',
      }),
      invalidatesTags: ['AttendanceDashboard'],
    }),

    // History
    getAttendanceHistory: builder.query<HistoryResponse, { limit?: number } | void>({
      query: (args) => ({
        url: '/api/v1/employee/attendance/history',
        params: { limit: args?.limit ?? 30 },
      }),
      providesTags: ['AttendanceHistory'],
    }),

    // Leaves
    getLeaveRequests: builder.query<LeaveListResponse, { status?: string } | void>({
      query: (args) => ({
        url: '/api/v1/employee/attendance/leave',
        params: args?.status ? { status: args.status } : undefined,
      }),
      providesTags: ['LeaveRequests'],
    }),

    submitLeaveRequest: builder.mutation<{ success: boolean; message: string; data: LeaveRequest }, LeaveCreateArgs>({
      query: (body) => ({
        url: '/api/v1/employee/attendance/leave',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LeaveRequests', 'AttendanceDashboard'],
    }),

    cancelLeaveRequest: builder.mutation<any, string | number>({
      query: (leaveRequestId) => ({
        url: `/api/v1/employee/attendance/leave/${leaveRequestId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LeaveRequests', 'AttendanceDashboard'],
    }),

    reviewLeaveRequest: builder.mutation<any, ReviewLeaveArgs>({
      query: ({ leaveRequestId, status, manager_note }) => ({
        url: `/api/v1/employee/attendance/leave/${leaveRequestId}/review`,
        method: 'PATCH',
        body: { status, manager_note },
      }),
      invalidatesTags: ['LeaveRequests', 'AttendanceDashboard'],
    }),

    // Emergency contact
    updateEmergencyContact: builder.mutation<any, EmergencyContactArgs>({
      query: (body) => ({
        url: '/api/v1/employee/attendance/emergency-contact',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AttendanceDashboard'],
    }),
  }),
});

export const {
  useGetAttendanceDashboardQuery,
  useClockInMutation,
  useClockOutMutation,
  useStartBreakMutation,
  useEndBreakMutation,
  useGetAttendanceHistoryQuery,
  useGetLeaveRequestsQuery,
  useSubmitLeaveRequestMutation,
  useCancelLeaveRequestMutation,
  useReviewLeaveRequestMutation,
  useUpdateEmergencyContactMutation,
} = attendanceApi;