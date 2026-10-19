import { apiSlice } from './apiSlice';
import type { Reservation, CreateReservationPayload,
   UpdateReservationPayload } from '../types/reservation';

export const reservationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Reservations
    getReservations: builder.query<Reservation[], void>({
      query: () => '/api/v1/restaurant/reservations/getbyauth',
      transformResponse: (response: { data: Reservation[] }) => response.data,
      providesTags: ['Dashboard'], // 👈 Changed to an existing tag
    }),

    // 2. Create Reservation
    createReservation: builder.mutation<Reservation, CreateReservationPayload>({
      query: (payload) => ({
        url: '/api/v1/restaurant/reservations/create',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Dashboard'], // 👈 Changed to an existing tag
    }),

    // 3. Update Reservation
    updateReservation: builder.mutation<Reservation, UpdateReservationPayload>({
      query: (payload) => ({
        url: '/api/v1/restaurant/reservations/update',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Dashboard'], // 👈 Changed to an existing tag
    }),

    // 4. Delete Reservation
    deleteReservation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/restaurant/reservations/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Dashboard'], // 👈 Changed to an existing tag
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
} = reservationApi;