import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RazorpayCreateOrderRequest {
  amount: number; // in paise (e.g., 50000 for ₹500)
  currency?: string;
  receipt?: string;
  description?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface RazorpayCreateOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
  message?: string;
}

export interface RazorpayVerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyPaymentResponse {
  success: boolean;
  message: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
}

export const razorpayApi = createApi({
  reducerPath: 'razorpayApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/v1/payments/razorpay`,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<RazorpayCreateOrderResponse, RazorpayCreateOrderRequest>({
      query: (orderData) => ({
        url: 'create-order',
        method: 'POST',
        body: orderData,
      }),
    }),

    verifyRazorpayPayment: builder.mutation<RazorpayVerifyPaymentResponse, RazorpayVerifyPaymentRequest>({
      query: (verificationData) => ({
        url: 'verify-payment',
        method: 'POST',
        body: verificationData,
      }),
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = razorpayApi;
