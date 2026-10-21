import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BannerResponse, BannersResponse, MessageResponse, StoreBanner } from "../../types/api-types";

export const bannerApi = createApi({
    reducerPath: 'bannerAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/v1`,
        credentials: 'include',
        prepareHeaders: (headers) => {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                headers.set('Authorization', `Bearer ${adminToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Banner'],
    endpoints: (builder) => ({
        getBanners: builder.query<BannersResponse, string | void>({
            query: (type) => (type ? `banners?type=${type}` : 'banners'),
            providesTags: ['Banner'],
        }),

        getAdminBanners: builder.query<BannersResponse, string | void>({
            query: (type) => (type ? `admin/banners?type=${type}` : 'admin/banners'),
            providesTags: ['Banner'],
        }),

        createBanner: builder.mutation<BannerResponse, Partial<StoreBanner>>({
            query: (banner) => ({
                url: 'admin/banners',
                method: 'POST',
                body: banner,
            }),
            invalidatesTags: ['Banner'],
        }),

        updateBanner: builder.mutation<BannerResponse, { id: string; banner: Partial<StoreBanner> }>({
            query: ({ id, banner }) => ({
                url: `admin/banners/${id}`,
                method: 'PUT',
                body: banner,
            }),
            invalidatesTags: ['Banner'],
        }),

        toggleBanner: builder.mutation<BannerResponse, string>({
            query: (id) => ({
                url: `admin/banners/${id}/toggle`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Banner'],
        }),

        deleteBanner: builder.mutation<MessageResponse, string>({
            query: (id) => ({
                url: `admin/banners/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Banner'],
        }),

        seedDefaultBanners: builder.mutation<BannersResponse, void>({
            query: () => ({
                url: 'admin/banners/seed-defaults',
                method: 'POST',
            }),
            invalidatesTags: ['Banner'],
        }),
    }),
});

export const {
    useGetBannersQuery,
    useGetAdminBannersQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useToggleBannerMutation,
    useDeleteBannerMutation,
    useSeedDefaultBannersMutation,
} = bannerApi;
