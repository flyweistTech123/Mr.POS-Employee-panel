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
  endpoints: (builder) => ({
    // ---- CATEGORIES ----
    getAllItemTypes: builder.query<any, void>({
      query: () => '/api/v1/admin/items_types/getbyauth',
    }),

    // ---- ITEMS ----
    // All items:     /api/v1/admin/items/list?category_id=all
    // By category:   /api/v1/admin/items/list?category_id=<Items_types_id>
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

    // ---- FLOORS ----
    getAllFloors: builder.query<any, void>({
      query: () => '/api/v1/admin/floor/getbyauth',
    }),

    // ---- TABLES ----
    getAllTables: builder.query<any, void>({
      query: () => '/api/v1/admin/table/getbyauth',
    }),
    getFloorWithTables: builder.query<any, string>({
      query: (id) => `/api/v1/admin/floor/getWithTables/${id}`,
    }),

    // ---- TABLE CURRENT ORDER ----
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
} = quickOrderApi;