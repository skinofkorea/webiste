import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreatePaymentIntentRequest {
  amount: number;
  email?: string;
  phone?: string;
  name?: string;
  orderId?: string;
  merchantTxnNo?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  client_secret?: string;
  message?: string;
  paymentURL?: string;
  merchantTxnNo?: string;
  gateway?: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/v1/payments`,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<CreatePaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (paymentIntent) => ({
        url: 'new',
        method: 'POST',
        body: paymentIntent,
      }),
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
} = paymentApi;

