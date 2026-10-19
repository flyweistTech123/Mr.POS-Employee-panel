import { apiSlice } from './apiSlice';

// Define types for better TypeScript support
interface ShiftDashboardResponse {
  success: boolean;
  data: {
    current_shift: any | null;
    upcoming_shifts: any[];
    team_schedule: any[];
    incoming_swap_requests: any[];
    outgoing_swap_requests: any[];
    coworkers: any[];
  };
}

interface SwapRequestArgs {
  requester_shift_id: number;
  target_employee_id: number;
  target_shift_id?: number | null;
  reason: string;
}

interface RespondSwapArgs {
  swapId: string;
  status: 'accepted' | 'rejected';
}

export const shiftApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShiftDashboard: builder.query<ShiftDashboardResponse, void>({
      // Added /api/v1 prefix
      query: () => '/api/v1/employee/shifts/dashboard',
      providesTags: ['ShiftDashboard'],
    }),
    
    requestShiftSwap: builder.mutation<any, SwapRequestArgs>({
      query: (data) => ({
        // Added /api/v1 prefix
        url: '/api/v1/employee/shifts/swap',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShiftDashboard'],
    }),
    
    respondToShiftSwap: builder.mutation<any, RespondSwapArgs>({
      query: ({ swapId, status }) => ({
        // Added /api/v1 prefix
        url: `/api/v1/employee/shifts/swap/${swapId}/respond`,
        // 🟢 Changed from PUT to PATCH based on your docs
        method: 'PATCH', 
        body: { status },
      }),
      invalidatesTags: ['ShiftDashboard'],
    }),

    // 🟢 NEW: Added Clock Out endpoint
    clockOut: builder.mutation<any, void>({
      query: () => ({
        url: '/api/v1/employee/attendance/clock-out',
        method: 'POST',
      }),
      invalidatesTags: ['ShiftDashboard'],
    }),
  }),
});

export const {
  useGetShiftDashboardQuery,
  useRequestShiftSwapMutation,
  useRespondToShiftSwapMutation,
  useClockOutMutation, // 🟢 Exported the new hook
} = shiftApiSlice;