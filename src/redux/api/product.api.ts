import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    BrandsResponse,
    CategoriesResponse,
    DeleteProductRequest,
    FeatureProductRequest,
    MessageResponse,
    NewProductRequest,
    ProductDetailResponse,
    ProductRequest,
    ProductResponse,
    SearchProductRequest,
    SearchProductResponse,
    ToggleActiveProductRequest,
    UpdateProductRequest
} from "../../types/api-types";


export const productApi = createApi({
    reducerPath: 'productAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/v1/products`,
        credentials: 'include',
        prepareHeaders: (headers) => {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                headers.set('Authorization', `Bearer ${adminToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Product'],
    endpoints: (builder) => ({
        latestProducts: builder.query<ProductResponse, string>({
            query: () => '/latest',
            providesTags: ['Product']
        }),
        allProducts: builder.query<ProductResponse, ProductRequest>({
            query: (req = {}) => {
                const { page = 1, limit = 50, search, category, brand, stockFilter, featured, sortBy } = req;
                const params = new URLSearchParams();
                if (page) params.append('page', String(page));
                if (limit) params.append('limit', String(limit));
                if (search) params.append('search', search);
                if (category && category !== 'All' && category !== 'all') params.append('category', category);
                if (brand && brand !== 'All' && brand !== 'all') params.append('brand', brand);
                if (stockFilter && stockFilter !== 'all' && stockFilter !== 'All') params.append('stockFilter', stockFilter);
                if (featured) params.append('featured', featured);
                if (sortBy) params.append('sortBy', typeof sortBy === 'object' ? JSON.stringify(sortBy) : sortBy);
                return `all?${params.toString()}`;
            },
            providesTags: ['Product'],
        }),

        categories: builder.query<CategoriesResponse, void | string>({
            query: () => '/categories',
            providesTags: ['Product']
        }),

        brands: builder.query<BrandsResponse, void | string>({
            query: () => '/brands',
            providesTags: ['Product']
        }),
        searchProducts: builder.query<SearchProductResponse, SearchProductRequest>({
            query: ({ price, search, sort, category, page }) => {
                let base = `/search?search=${search}&page=${page}`;
                if (price) base += `&price=${price}`;
                if (sort) base += `&sort=${sort}`;
                if (category) base += `&category=${category}`;
                return base;
            },
            providesTags: ['Product'],
        }),
        newProduct: builder.mutation<MessageResponse, NewProductRequest>({
            query: ({ productData }) => ({
                url: `new`,
                method: 'POST',
                body: productData,
            }),
            invalidatesTags: ['Product'],
        }),
        productDetails: builder.query<ProductDetailResponse, string>({
            query: (id) => id,
            providesTags: ['Product']
        }),
        updateProduct: builder.mutation<MessageResponse, UpdateProductRequest>({
            query: ({ formData, productId, }) => ({
                url: `${productId}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Product'],

        }),
        deleteProduct: builder.mutation<MessageResponse, DeleteProductRequest>({
            query: ({ productId }) => ({
                url: `${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
        getAllFeaturedProducts: builder.query<ProductResponse, string>({
            query: () => 'featured',
            providesTags: ['Product']
        }),
        featureProduct: builder.mutation<MessageResponse, FeatureProductRequest>({
            query: ({ productId }) => ({
                url: `feature/${productId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Product']
        }),
        toggleActiveProduct: builder.mutation<MessageResponse, ToggleActiveProductRequest>({
            query: ({ productId }) => ({
                url: `toggle-active/${productId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Product']
        }),
    }),
});

export const {
    useLatestProductsQuery,
    useAllProductsQuery,
    useCategoriesQuery,
    useBrandsQuery,
    useSearchProductsQuery,
    useNewProductMutation,
    useProductDetailsQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetAllFeaturedProductsQuery,
    useFeatureProductMutation,
    useToggleActiveProductMutation,
} = productApi;

