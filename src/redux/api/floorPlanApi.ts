/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface LayoutTablePayload {
  table_id: number;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface SaveLayoutArgs {
  floorId: string | number;
  tables: LayoutTablePayload[];
}

// Dedicated slice for floor-plan editing ONLY.
// Does not touch order flow, tables, floors, or any existing tag.
export const floorPlanApi = createApi({
  reducerPath: 'floorPlanApi',
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL || 'https://pos-backend-7xuw.onrender.com',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['FloorLayout'],
  endpoints: (builder) => ({
    saveFloorLayout: builder.mutation<{ success: boolean }, SaveLayoutArgs>({
      query: ({ floorId, tables }) => ({
        url: `/api/v1/employee/table_booking/floor-plan/${floorId}/layout`,
        method: 'PUT',
        body: { tables },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'FloorLayout', id: String(arg.floorId) },
      ],
    }),
  }),
});

export const { useSaveFloorLayoutMutation } = floorPlanApi;