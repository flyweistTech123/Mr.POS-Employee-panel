import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ==========================================
// --- TYPES ---
// ==========================================
export interface BarTabItem {
  _id: string;
  drink_item_id: number;
  drink_name: string;
  unit_price: number;
  quantity: number;
  modifiers: string[];
  line_total: number;
  added_at: string;
}

export interface BarTab {
  _id: string;
  Bar_Tab_id: number;
  Restaurant_id: number;
  client_name: string;
  table_no: string;
  status: 'Open' | 'Closed';
  items: BarTabItem[];
  subtotal: number;
  total: number;
  currency: string;
  payment?: { currency?: string };
  CreateBy: number;
  CreateAt: string;
  UpdatedAt?: string;
  UpdatedBy?: number;
}

export interface BarTabCreateBody {
  client_name: string;
  table_no: string;
  items: {
    drink_item_id: number;
    quantity: number;
    modifiers: string[];
  }[];
}

export interface BarTabAddItemBody {
  tabId: number;
  drink_item_id: number;
  quantity: number;
  modifiers: string[];
}

export interface BarTabClosePaymentBody {
  tabId: number;
  Payment_Options_id: number;
  payment_method: string;
  payment_confirmed: boolean;
  payment_reference?: string;
}

// ==========================================
// --- API SLICE ---
// ==========================================
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
  tagTypes: ['Order', 'OrderList', 'PaymentOptions', 'Customer', 'BarTabs'],
  endpoints: (builder) => ({
    
    // ==========================================
    // ---- CATEGORIES ----
    // ==========================================
    getAllItemTypes: builder.query<any, { type?: string } | void>({
      query: (arg) => {
        const type = (arg as any)?.type;
        return type
          ? `/api/v1/admin/items_types/getbyauth?type=${encodeURIComponent(type)}`
          : '/api/v1/admin/items_types/getbyauth';
      },
    }),

    // ==========================================
    // ---- ITEMS ----
    // ==========================================
    getAllItems: builder.query<
      any,
      { type?: string; category_id?: string | number; search?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        const a = (arg as any) || {};
        if (a.type) params.set('type', a.type);
        params.set('category_id', a.category_id ?? 'all');
        if (a.search) params.set('search', a.search);
        return `/api/v1/admin/items/list?${params.toString()}`;
      },
    }),
    
    getItemTypeById: builder.query<any, string>({
      query: (id) => `/api/v1/admin/items/list?category_id=${id}`,
      forceRefetch: () => true,
    }),

    // ==========================================
    // ---- VARIANTS & ADDONS ----
    // ==========================================
    getAllItemVariants: builder.query<any, void>({
      query: () => '/api/v1/restaurant/item_variants/getbyauth',
    }),
    
    getAllItemAddons: builder.query<any, void>({
      query: () => '/api/v1/restaurant/item_addons/getbyauth',
    }),

    // ==========================================
    // ---- KITCHENS / FLOORS / TABLES ----
    // ==========================================
    getAllKitchens: builder.query<any, void>({
      query: () => '/api/v1/restaurant/kitchen/getbyauth',
    }),
    
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

    // ==========================================
    // ---- CUSTOMERS ----
    // ==========================================
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

    // ==========================================
    // ---- PAYMENT OPTIONS ----
    // ==========================================
    getMyPaymentOptions: builder.query<any, void>({
      query: () => '/api/v1/restaurant/payment_options/auth/my-options',
      providesTags: ['PaymentOptions'],
    }),

    // ==========================================
    // ---- POS ORDERS ----
    // ==========================================
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

    // ==========================================
    // ---- BAR TABS ----
    // ==========================================
    getAllBarTabs: builder.query<{ success: boolean; count: number; data: BarTab[] }, { status?: string } | void>({
      query: (arg) => {
        const status = (arg as any)?.status || 'Open';
        return `/api/v1/restaurant/bar-tabs/getall?status=${encodeURIComponent(status)}`;
      },
      providesTags: ['BarTabs'],
    }),

    getBarTabById: builder.query<{ success: boolean; data: BarTab }, number | string>({
      query: (id) => `/api/v1/restaurant/bar-tabs/getbyid/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'BarTabs', id }],
    }),

    createBarTab: builder.mutation<{ success: boolean; data: BarTab }, BarTabCreateBody>({
      query: (body) => ({
        url: '/api/v1/restaurant/bar-tabs/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BarTabs'],
    }),

    addBarTabItem: builder.mutation<{ success: boolean; data: BarTab }, BarTabAddItemBody>({
      query: ({ tabId, ...body }) => ({
        url: `/api/v1/restaurant/bar-tabs/add-item/${tabId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BarTabs', id: arg.tabId }, 'BarTabs'],
    }),

    closeBarTabWithPayment: builder.mutation<{ success: boolean; data: BarTab }, BarTabClosePaymentBody>({
      query: ({ tabId, ...body }) => ({
        url: `/api/v1/restaurant/bar-tabs/close/${tabId}/payment`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'BarTabs', id: arg.tabId }, 'BarTabs'],
    }),
  }),
});

// ==========================================
// --- EXPORT HOOKS ---
// ==========================================
export const {
  // Categories & Items
  useGetAllItemTypesQuery,
  useGetAllItemsQuery,
  useGetItemTypeByIdQuery,
  
  // Variants & Addons
  useGetAllItemVariantsQuery,
  useGetAllItemAddonsQuery,
  
  // Kitchens & Floors
  useGetAllKitchensQuery,
  useGetAllFloorsQuery,
  useGetAllTablesQuery,
  useGetFloorWithTablesQuery,
  useGetTableCurrentOrderQuery,
  
  // Customers
  useGetAllCustomersQuery,
  useSearchCustomerQuery,
  useCreateCustomerMutation,
  
  // Payments
  useGetMyPaymentOptionsQuery,
  
  // POS Orders
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderItemMutation,
  useSendToKitchenMutation,
  useUpdateOrderItemStatusMutation,
  useUpdateOrderStatusMutation,
  useGetOrderByIdQuery,
  useGetOrderPdfUrlQuery,
  useGetAllOrdersQuery,
  
  // Bar Tabs
  useGetAllBarTabsQuery,
  useGetBarTabByIdQuery,
  useCreateBarTabMutation,
  useAddBarTabItemMutation,
  useCloseBarTabWithPaymentMutation,
} = quickOrderApi;