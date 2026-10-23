import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const orderHistoryApi = createApi({
  reducerPath: 'orderHistoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://vercel-mr-clement-pos-backend.vercel.app',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['OrderHistory', 'QrOrders'],
  endpoints: (builder) => ({
    getAllOrderHistory: builder.query<any, any>({
      query: ({ page = 1, limit = 10, search = '', order_status = '', client_mobile_no = '', table_id = '', floor_id = '' }) =>
        `/api/v1/restaurant/pos_order/getall?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&order_status=${encodeURIComponent(order_status)}&client_mobile_no=${encodeURIComponent(client_mobile_no)}&table_id=${encodeURIComponent(table_id)}&floor_id=${encodeURIComponent(floor_id)}`,
      transformResponse: (response: any) => response,
      providesTags: (result) =>
        result
          ? [
              ...(result.data || []).map((order: any) => ({ type: 'OrderHistory' as const, id: order._id })),
              { type: 'OrderHistory' as const, id: 'LIST' },
            ]
          : [{ type: 'OrderHistory' as const, id: 'LIST' }],
    }),
    getOrderHistoryByDateRange: builder.query<any, any>({
      query: ({ start_date, end_date, page = 1, limit = 10 }) =>
        `/api/v1/restaurant/pos_order/getall?start_date=${start_date}&end_date=${end_date}&page=${page}&limit=${limit}`,
      transformResponse: (response: any) => response,
      providesTags: (result) =>
        result
          ? [
              ...(result.data || []).map((order: any) => ({ type: 'OrderHistory' as const, id: order._id })),
              { type: 'OrderHistory' as const, id: 'LIST' },
            ]
          : [{ type: 'OrderHistory' as const, id: 'LIST' }],
    }),
    getOrderHistoryByStatus: builder.query<any, any>({
      query: ({ status, page = 1, limit = 10 }) =>
        `/api/v1/restaurant/pos_order/getall?order_status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`,
      transformResponse: (response: any) => response,
      providesTags: (result) =>
        result
          ? [
              ...(result.data || []).map((order: any) => ({ type: 'OrderHistory' as const, id: order._id })),
              { type: 'OrderHistory' as const, id: 'LIST' },
            ]
          : [{ type: 'OrderHistory' as const, id: 'LIST' }],
    }),

    // ============================================================
    // NEW: QR Dining Orders
    // GET {{baseurl}}/api/v1/restaurant/qr-orders/getall?status=Pending&limit=50
    // ============================================================
    getAllQrOrders: builder.query<any, { status?: string; limit?: number; restaurant_id?: number | string }>({
      query: ({ status = 'Pending', limit = 50, restaurant_id }) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        params.set('limit', String(limit));
        if (restaurant_id !== undefined) params.set('Restaurant_id', String(restaurant_id));
        return `/api/v1/restaurant/qr-orders/getall?${params.toString()}`;
      },
      transformResponse: (response: any) => response,
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((order: any) => ({ type: 'QrOrders' as const, id: order._id })),
              { type: 'QrOrders' as const, id: 'LIST' },
            ]
          : [{ type: 'QrOrders' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllOrderHistoryQuery,
  useGetOrderHistoryByDateRangeQuery,
  useGetOrderHistoryByStatusQuery,
  useGetAllQrOrdersQuery,
} = orderHistoryApi;