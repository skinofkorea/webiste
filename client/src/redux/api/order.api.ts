import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AllOrdersResponse, MessageResponse, NewOrderRequest, NewOrderResponse, OrderDetailsResponse, UpdateOrderRequest } from "../../types/api-types";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/v1/orders/`,
        credentials: 'include',
        prepareHeaders: (headers) => {
            // Add admin token if exists (for protected admin endpoints)
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                headers.set('Authorization', `Bearer ${adminToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ['orders'],
    endpoints: (builder) => ({
        newOrder: builder.mutation<NewOrderResponse, NewOrderRequest>({
            query: (order) => ({
                url: `new`,
                method: 'POST',
                body: order,
            }),
            invalidatesTags: ['orders']
        }),
        myOrders: builder.query<AllOrdersResponse, string>({
            query: (userId) => (`my?userId=${userId}`),
            providesTags: ['orders']
        }),
        allOrders: builder.query<AllOrdersResponse, string>({
            query: () => (`all`),
            providesTags: ['orders']
        }),
        orderDetails: builder.query<OrderDetailsResponse, string>({
            query: (id) => id,
            providesTags: ['orders']
        }),
        deleteOrder: builder.mutation<MessageResponse, string>({
            query: (id) => ({
                url: `delete/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['orders']
        }),
        updateOrderStatus: builder.mutation<MessageResponse, UpdateOrderRequest>({
            query: (order) => ({
                url: `update-status`,
                method: 'PUT',
                body: order
            }),
            invalidatesTags: ['orders'],
        }),
    })
});

export const {
    useNewOrderMutation,
    useAllOrdersQuery,
    useMyOrdersQuery,
    useOrderDetailsQuery,
    useDeleteOrderMutation,
    useUpdateOrderStatusMutation
} = orderApi; // This is a placeholder to avoid TS error

