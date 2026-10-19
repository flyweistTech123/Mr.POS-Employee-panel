import { apiSlice } from './apiSlice'; // Assuming your base apiSlice is here

export const shiftApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShiftDashboard: builder.query({
      query: () => '/employee/shifts/dashboard',
      providesTags: ['ShiftDashboard'],
    }),
    requestShiftSwap: builder.mutation({
      query: (data) => ({
        url: '/employee/shifts/swap',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShiftDashboard'],
    }),
    respondToShiftSwap: builder.mutation({
      query: ({ swapId, status }) => ({
        url: `/employee/shifts/swap/${swapId}/respond`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['ShiftDashboard'],
    }),
  }),
});

export const {
  useGetShiftDashboardQuery,
  useRequestShiftSwapMutation,
  useRespondToShiftSwapMutation,
} = shiftApiSlice;