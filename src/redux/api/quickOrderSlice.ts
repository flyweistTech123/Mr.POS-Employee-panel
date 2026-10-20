import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quickOrderApi = createApi({
  reducerPath: 'quickOrderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://pos-backend-7xuw.onrender.com',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Order', 'OrderList', 'PaymentOptions', 'Customer'],
  endpoints: (builder) => ({
    // ---- CATEGORIES ----
    getAllItemTypes: builder.query<any, void>({
      query: () => '/api/v1/admin/items_types/getbyauth',
    }),

    // ---- ITEMS ----
    getAllItems: builder.query<any, void>({
      query: () => '/api/v1/admin/items/list?category_id=all',
    }),
    getItemTypeById: builder.query<any, string>({
      query: (id) => `/api/v1/admin/items/list?category_id=${id}`,
      forceRefetch: () => true,
    }),

    // ---- VARIANTS ----
    getAllItemVariants: builder.query<any, void>({
      query: () => '/api/v1/restaurant/item_variants/getbyauth',
    }),

    // ---- ADDONS ----
    getAllItemAddons: builder.query<any, void>({
      query: () => '/api/v1/restaurant/item_addons/getbyauth',
    }),

    // ---- KITCHENS ----
    getAllKitchens: builder.query<any, void>({
      query: () => '/api/v1/restaurant/kitchen/getbyauth',
    }),

    // ---- FLOORS / TABLES ----
    getAllFloors: builder.query<any, void>({
      query: () => '/api/v1/admin/floor/getbyauth',
    }),
    getAllTables: builder.query<any, void>({
      query: () => '/api/v1/admin/table/getbyauth',
    }),
    getFloorWithTables: builder.query<any, string>({
      query: (id) => `/api/v1/admin/floor/getWithTables/${id}`,
    }),
    getTableCurrentOrder: builder.query<any, number>({
      query: (tableId) => `/api/v1/restaurant/pos_order/table/${tableId}/current-order`,
    }),

    // ---- CUSTOMERS ----
    getAllCustomers: builder.query<any, void>({
      query: () => '/api/v1/restaurant/customer/getbyauth',
    }),
    searchCustomer: builder.query<any, string>({
      query: (q) => `/api/v1/restaurant/customer/search?query=${encodeURIComponent(q)}`,
    }),
    createCustomer: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: '/api/v1/restaurant/customer/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer'],
    }),

    // ---- PAYMENT OPTIONS ----
    getMyPaymentOptions: builder.query<any, void>({
      query: () => '/api/v1/restaurant/payment_options/auth/my-options',
      providesTags: ['PaymentOptions'],
    }),

    // ---- POS ORDERS ----
    createOrder: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: '/api/v1/restaurant/pos_order/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrderList'],
    }),

    updateOrder: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: '/api/v1/restaurant/pos_order/update',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Order', id: arg.id }, 'OrderList'],
    }),

    deleteOrderItem: builder.mutation<any, { orderId: number | string; itemId: number | string }>({
      query: ({ orderId, itemId }) => ({
        url: `/api/v1/restaurant/pos_order/delete-item/${orderId}/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Order', id: arg.orderId }],
    }),

    sendToKitchen: builder.mutation<any, { id: number | string }>({
      query: (body) => ({
        url: '/api/v1/restaurant/pos_order/send-to-kitchen',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Order', id: arg.id }],
    }),

    updateOrderItemStatus: builder.mutation<
      any,
      { id: number | string; item_id: number; item_status: string; item_note?: string }
    >({
      query: (body) => ({
        url: '/api/v1/restaurant/pos_order/update-item-status',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Order', id: arg.id }],
    }),

    updateOrderStatus: builder.mutation<any, { id: number | string; Order_Status: string }>({
      query: (body) => ({
        url: '/api/v1/restaurant/pos_order/update-status',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Order', id: arg.id }, 'OrderList'],
    }),

    getOrderById: builder.query<any, number | string>({
      query: (id) => `/api/v1/restaurant/pos_order/getbyid/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),

    getOrderPdfUrl: builder.query<string, number | string>({
      query: (id) => `/api/v1/restaurant/pos_order/getbyid/${id}/pdf`,
    }),

    getAllOrders: builder.query<any, { filter?: string } | void>({
      query: (arg) => {
        const filter = (arg as any)?.filter;
        return filter
          ? `/api/v1/restaurant/pos_order/getall?filter=${filter}`
          : '/api/v1/restaurant/pos_order/getall';
      },
      providesTags: ['OrderList'],
    }),
  }),
});

export const {
  useGetAllItemTypesQuery,
  useGetAllItemsQuery,
  useGetItemTypeByIdQuery,
  useGetAllItemVariantsQuery,
  useGetAllItemAddonsQuery,
  useGetAllKitchensQuery,
  useGetAllFloorsQuery,
  useGetAllTablesQuery,
  useGetFloorWithTablesQuery,
  useGetTableCurrentOrderQuery,
  useGetAllCustomersQuery,
  useSearchCustomerQuery,
  useCreateCustomerMutation,
  useGetMyPaymentOptionsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderItemMutation,
  useSendToKitchenMutation,
  useUpdateOrderItemStatusMutation,
  useUpdateOrderStatusMutation,
  useGetOrderByIdQuery,
  useGetOrderPdfUrlQuery,
  useGetAllOrdersQuery,
} = quickOrderApi;