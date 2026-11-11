import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RevolutCreateOrderRequest {
  amount: number; // in pence (e.g. 1595 for £15.95)
  currency?: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: Record<string, string>;
  redirect_url?: string;
}

export interface RevolutCreateOrderResponse {
  success: boolean;
  configured: boolean;
  id?: string;
  token?: string;
  checkout_url?: string;
  state?: string;
  mode?: 'prod' | 'sandbox';
  mockOrderId?: string;
  mockToken?: string;
  message?: string;
}

export interface RevolutConfigResponse {
  success: boolean;
  configured: boolean;
  mode: 'prod' | 'sandbox';
}

export const revolutApi = createApi({
  reducerPath: 'revolutApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/payments/revolut',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createRevolutOrder: builder.mutation<RevolutCreateOrderResponse, RevolutCreateOrderRequest>({
      query: (orderData) => ({
        url: 'create-order',
        method: 'POST',
        body: orderData,
      }),
    }),

    getRevolutConfig: builder.query<RevolutConfigResponse, void>({
      query: () => 'config',
    }),
  }),
});

export const {
  useCreateRevolutOrderMutation,
  useGetRevolutConfigQuery,
} = revolutApi;
