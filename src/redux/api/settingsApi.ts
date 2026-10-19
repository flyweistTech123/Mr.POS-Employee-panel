// src/redux/api/settingsApi.ts
import { apiSlice } from './apiSlice';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface SettingsProfileResponse {
  success: boolean;
  message?: string;
  data: {
    emergency_contact: {
      enabled: boolean;
      name: string | null;
      phone: string | null;
      email: string | null;
    };
    recovery_email: string | null;
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    employee_id_code: string;
    role: string;
    permissions: string[];
    responsibility: string;
    onboarding_date: string;
    experience_years: number;
    shift_timings: string;
    total_leave_days: number;
    leave_left_days: number;
    overall_performance: number;
    task_completion: number;
    billing_accuracy: number;
    reviews_count: number;
    profile_image: string;
    Status: boolean;
    CreateBy: number;
    CreateAt: string;
    UpdatedAt: string;
    employee_id: number;
    socialAccounts: any[];
    full_name: string;
    employee_login_code: string;
    id: string;
  };
}

export interface WorkSummaryResponse {
  success: boolean;
  data: {
    employee: { employee_id: number; name: string; role: string };
    today_progress: { worked_minutes: number; target_minutes: number };
    weekly_summary: Array<{ date: string; amount: number }>;
    total_orders_served: number;
    order_pending: number;
    total_guests_served: number;
  };
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  data: any[];
}

export interface ChangePasswordArgs {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/* ---- Support Ticket Types ---- */

export interface SupportTicket {
  _id: string;
  support_ticket_id: number;
  question: string;
  support_ticket_type_id: number;
  customer_id: number;
  Ticket_status: 'Open' | 'Process' | 'Solve';
  Status: boolean;
  CreateAt: string;
  Customer: { Customer_id: number; Name: string; phone: string } | null;
  CreateBy: { user_id: number; Name: string; email: string };
  SupportTicketType?: { name: string } | null;
}

export interface SupportTicketReply {
  _id: string;
  support_ticket_reply_id: number;
  support_ticket_id: number;
  reply: string;
  employee_id: number;
  Ticket_status: string;
  Status: boolean;
  CreateAt: string;
  Employee?: { user_id: number; Name: string; email: string };
}

export interface CreateTicketArgs {
  support_ticket_type_id: number;
  question: string;
  customer_id: number;
  Ticket_status: string;
  Status: boolean;
}

export interface CreateReplyArgs {
  support_ticket_id: number;
  reply: string;
  employee_id: number;
  Ticket_status: string;
  Status: boolean;
}

/* ------------------------------------------------------------------ */
/* Slice                                                              */
/* ------------------------------------------------------------------ */

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* Settings Endpoints */
    getProfile: builder.query<SettingsProfileResponse, void>({
      query: () => '/api/v1/employee/settings/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<SettingsProfileResponse, Record<string, any>>({
      query: (body) => ({
        url: '/api/v1/employee/settings/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    getWorkSummary: builder.query<WorkSummaryResponse, void>({
      query: () => '/api/v1/employee/settings/work-summary',
      providesTags: ['WorkSummary'],
    }),
    getNotifications: builder.query<NotificationsResponse, { limit?: number } | void>({
      query: (args) => {
        const limit = args?.limit ?? 50;
        return `/api/v1/employee/settings/notifications?limit=${limit}`;
      },
      providesTags: ['Notifications'],
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordArgs>({
      query: (body) => ({
        url: '/api/v1/employee/settings/change-password',
        method: 'PUT',
        body,
      }),
    }),

    /* Support Ticket Endpoints */
    getSupportTickets: builder.query<{ success: boolean; count: number; data: SupportTicket[] }, void>({
      query: () => '/api/v1/restaurant/support_ticket/getbyauth',
      providesTags: ['SupportTickets'],
    }),
    getSupportTicketById: builder.query<{ success: boolean; data: SupportTicket }, number>({
      query: (id) => `/api/v1/restaurant/support_ticket/getbyid/${id}`,
      providesTags: (result, error, id) => [{ type: 'SupportTickets', id }],
    }),
    getSupportTicketReplies: builder.query<{ success: boolean; count: number; data: SupportTicketReply[] }, number>({
      query: (ticketId) => `/api/v1/restaurant/support_ticket_reply/getall?ticket_id=${ticketId}`,
      providesTags: (result, error, id) => [{ type: 'SupportReplies', id }],
    }),
    createSupportTicket: builder.mutation<{ success: boolean; data: SupportTicket }, CreateTicketArgs>({
      query: (body) => ({
        url: '/api/v1/restaurant/support_ticket/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportTickets'],
    }),
    createSupportTicketReply: builder.mutation<{ success: boolean; data: SupportTicketReply }, CreateReplyArgs>({
      query: (body) => ({
        url: '/api/v1/restaurant/support_ticket_reply/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'SupportReplies', id: arg.support_ticket_id }, 'SupportTickets'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetWorkSummaryQuery,
  useGetNotificationsQuery,
  useChangePasswordMutation,
  useGetSupportTicketsQuery,
  useGetSupportTicketByIdQuery,
  useGetSupportTicketRepliesQuery,
  useCreateSupportTicketMutation,
  useCreateSupportTicketReplyMutation,
} = settingsApi;