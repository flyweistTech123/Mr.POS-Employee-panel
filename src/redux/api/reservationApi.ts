import { apiSlice } from './apiSlice';
import type { Reservation, CreateReservationPayload, UpdateReservationPayload } from '../../types/reservation';

export const reservationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Reservations
    getReservations: builder.query<Reservation[], void>({
      query: () => '/api/v1/restaurant/reservations/getbyauth',
      // Assumes your API returns { success: true, data: [...] }
      transformResponse: (response: { data: Reservation[] }) => response.data,
      providesTags: ['Reservations'], // We'll add this tag to the apiSlice later
    }),

    // 2. Create Reservation
    createReservation: builder.mutation<Reservation, CreateReservationPayload>({
      query: (payload) => ({
        url: '/api/v1/restaurant/reservations/create',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Reservations'], // Auto-refetches the list after creation
    }),

    // 3. Update Reservation
    updateReservation: builder.mutation<Reservation, UpdateReservationPayload>({
      query: (payload) => ({
        url: '/api/v1/restaurant/reservations/update',
        method: 'PUT', // or PATCH depending on your backend
        body: payload,
      }),
      invalidatesTags: ['Reservations'],
    }),

    // 4. Delete Reservation
    deleteReservation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/restaurant/reservations/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reservations'],
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
} = reservationApi;