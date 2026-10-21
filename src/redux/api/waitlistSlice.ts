/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from './apiSlice';

export interface WaitlistGuest {
  _id: string;
  Waitlist_id: number;
  Restaurant_id: number;
  Customer_id: number | null;
  customer_name: string;
  phone: string;
  persons: number;
  Floor_id: number;
  Table_id: number | null;
  save_customer: boolean;
  status: "Waiting" | "Notified" | "Seated" | "Cancelled" | string;
  notified_at: string | null;
  seated_at: string | null;
  notification_count: number;
  CreateBy: number;
  joined_at: string;
  notifications: Array<{
    channel: string;
    delivery_reference: string;
    sent_at?: string;
  }>;
  CreateAt: string;
  waiting_minutes: number;
}

export interface CreateWaitlistBody {
  customer_name: string;
  phone: string;
  persons: number;
  Floor_id: number;
  Table_id?: number | null;
  save_customer?: boolean;
}

export interface NotifyBody {
  channel?: string;
  delivery_reference?: string;
}

export const waitlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWaitlist: builder.query<
      { success: boolean; count: number; data: WaitlistGuest[] },
      { status?: string } | void
>({
      query: (arg) => ({
        url: "/api/v1/restaurant/waitlist/getall",
        params: arg?.status ? { status: arg.status } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((g) => ({
                type: "Waitlist" as const,
                id: g.Waitlist_id,
              })),
              { type: "Waitlist" as const, id: "LIST" },
            ]
          : [{ type: "Waitlist" as const, id: "LIST" }],
    }),

    getWaitlistById: builder.query<
      { success: boolean; data: WaitlistGuest },
      number | string
    >({
      query: (id) => `/api/v1/restaurant/waitlist/getbyid/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Waitlist", id }],
    }),

    notifyWaitlistGuest: builder.mutation<
      { success: boolean; data?: any },
      { id: number | string } & NotifyBody
    >({
      query: ({ id, channel = "SMS", delivery_reference }) => ({
        url: `/api/v1/restaurant/waitlist/notify/${id}`,
        method: "POST",
        body: {
          channel,
          delivery_reference:
            delivery_reference ?? `${channel}-PROVIDER-REFERENCE-${Date.now()}`,
        },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Waitlist", id },
        { type: "Waitlist", id: "LIST" },
      ],
    }),

    // Adjust route if your backend differs
    createWaitlist: builder.mutation<
      { success: boolean; data: WaitlistGuest },
      CreateWaitlistBody
    >({
      query: (body) => ({
        url: "/api/v1/restaurant/waitlist/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Waitlist", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWaitlistQuery,
  useGetWaitlistByIdQuery,
  useNotifyWaitlistGuestMutation,
  useCreateWaitlistMutation,
} = waitlistApi;