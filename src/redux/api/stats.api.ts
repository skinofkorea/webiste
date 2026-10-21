import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StatsResponse } from '../../types/api-types';

export const statsApi = createApi({
    reducerPath: 'statsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/v1/stats/`,
        credentials: 'include',
        prepareHeaders: (headers) => {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                headers.set('Authorization', `Bearer ${adminToken}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getStats: builder.query<StatsResponse, void>({
            query: () => '',
        }),
    }),
});

export const {
    useGetStatsQuery,
} = statsApi;

