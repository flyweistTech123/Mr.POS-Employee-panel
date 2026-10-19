import { apiSlice } from './apiSlice';
import type { Reservation, CreateReservationPayload, UpdateReservationPayload } from '../../types/reservation';

export const reservationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query<Reservation[], void>({
      query: () => '/api/v1/restaurant/reservations/getbyauth',
      transformResponse: (response: { data: Reservation[] }) => response.data,
      providesTags: ['Reservations'], // ✅ Matches apiSlice now
    }),
    createReservation: builder.mutation<Reservation, CreateReservationPayload>({
      query: (payload) => ({
        url: '/api/v1/restaurant/reservations/create',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Reservations'], // ✅ Matches apiSlice now
    }),
    updateReservation: builder.mutation<Reservation, UpdateReservationPayload>({
      query: (payload) => ({
        url: '/api/v1/restaurant/reservations/update',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Reservations'],
    }),
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