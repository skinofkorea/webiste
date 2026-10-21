import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER || '';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AdminVerifyResponse {
  success: boolean;
  admin?: {
    id: string;
    email: string;
    name: string;
  };
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/api/v1/admin` }),
  endpoints: (builder) => ({
    // Admin login
    adminLogin: builder.mutation<AdminLoginResponse, AdminLoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Verify admin token
    verifyAdmin: builder.query<AdminVerifyResponse, string>({
      query: (token) => ({
        url: '/verify',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    // Admin logout
    adminLogout: builder.mutation<{ success: boolean }, string>({
      query: (token) => ({
        url: '/logout',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useVerifyAdminQuery,
  useAdminLogoutMutation,
} = adminApi;

