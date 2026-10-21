import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface StripeCreateIntentRequest {
  amount: number; // in pence (e.g. 1595 for £15.95)
  currency?: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: Record<string, string>;
}

export interface StripeCreateIntentResponse {
  success: boolean;
  configured: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  publicKey?: string;
  mockSecret?: string;
  message?: string;
}

export interface StripeConfigResponse {
  success: boolean;
  configured: boolean;
  publicKey?: string;
}

export const stripeApi = createApi({
  reducerPath: 'stripeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/payments/stripe',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<StripeCreateIntentResponse, StripeCreateIntentRequest>({
      query: (intentData) => ({
        url: 'create-payment-intent',
        method: 'POST',
        body: intentData,
      }),
    }),

    getStripeConfig: builder.query<StripeConfigResponse, void>({
      query: () => 'config',
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useGetStripeConfigQuery,
} = stripeApi;
