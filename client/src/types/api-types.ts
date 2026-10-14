export interface User {
    uid: string;
    name: string;
    dob: string;
    gender: string;
    email: string;
    displayName: string;
    photoURL: string;
    provider: string;
    _id: string;
    role: "admin" | "user";
}
export type MessageResponse = {
    success: boolean;
    message: string;
}

export type UserLoginResponse = {
    success: boolean;
    user: User;
    token: string;
}

export type UserLoginRequest = {
    idToken: string;
}

export type UserRegisterRequest = {
    idToken: string;
    name: string;
    gender: string;
    dob: string
}

export type AllUserResponse = {
    success: boolean;
    users: User[];
}

export type UserResponse = {
    success: boolean;
    user: User;
}

export interface UserReducerIntialState {
    user: User | null;
    loading: boolean;
}

// Product
export interface Product {
    name: string;
    _id: string;
    category: string;
    stock: number;
    photo: string;
    price: number;
    currency?: string;
    description: string;
    featured: boolean;
    isActive?: boolean;
    variants?: any[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductResponse {
    success: boolean;
    products: Product[];
    totalProducts: number;
    totalPages: number;
    currentPage: number;
}


interface SortBy {
    id: string;
    desc: boolean;
}

export interface ProductRequest {
    page: number;
    limit: number;
    sortBy?: SortBy;
}

// New Product
export type NewProductRequest = {
    productData: any;
}

// Product Details
export type ProductDetailResponse = {
    success: boolean;
    product: Product;
}

// Update Product
export type UpdateProductRequest = {
    productId: string;
    formData: any;
}

// Delete Product
export type DeleteProductRequest = {
    productId: string;
}

// Categories 
export type CategoriesResponse = {
    success: boolean;
    categories: string[];
}

// feature Product
export type FeatureProductRequest = {
    productId: string;
}

// toggle active Product
export type ToggleActiveProductRequest = {
    productId: string;
}

// Search Product
export type SearchProductRequest = {
    price: string;
    page: number;
    category: string;
    search: string;
    sort: string;
}

export type SearchProductResponse = ProductResponse & {
    totalPage: number;
}

// -- Order Types -- 
// Cart Item
export type CartItem = {
    productId: string;
    photo: string;
    name: string;
    price: number;
    currency?: string;
    quantity: number;
    stock: number;
};

// Shipping Info
export type ShippingInfo = {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
    couponCode?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    deliveryType?: 'current_location' | 'nearest_landmark';
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    clientOrigin?: string;
}

// Order Item
export type OrderItem = Omit<CartItem, "stock"> & { _id: string };

// Order 
export type Order = {
    orderItems: OrderItem[];
    shippingInfo: ShippingInfo;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    currency?: string;
    status: string;
    user: {
        name: string;
        _id: string;
        email?: string;
    };
    _id: string;
    createdAt: string;
    updatedAt: string;
    awbNumber?: string;
    senderMobile?: string;
    receiverMobile?: string;
    trackingUrl?: string;
}

// All Orders
export type AllOrdersResponse = {
    success: boolean;
    orders: Order[];
}

// Order Details
export type OrderDetailsResponse = {
    success: boolean;
    order: Order;
}

// New Order 
export type NewOrderRequest = {
    orderItems: CartItem[];
    subTotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    currency: string;
    shippingInfo: ShippingInfo;
    userId: string;
}

export type NewOrderResponse = MessageResponse & {
    order?: {
        id?: string;
        _id?: string;
    };
}

// Update Order
export type UpdateOrderRequest = {
    orderId: string;
    status: string;
    awbNumber?: string;
    senderMobile?: string;
    receiverMobile?: string;
}

//  -- Coupon Types --
export type Coupon = {
    code: string;
    amount: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export type AllCouponsResponse = {
    success: boolean;
    coupons: Coupon[];
}

export type AllCouponsRequest = {
    page: number;
}

export type ApplyCouponRequest = {
    code: string;
}

export type ApplyCouponResponse = {
    success: boolean;
    coupon: Coupon;
    message: string;
}

export type NewCouponRequest = {
    code: string;
    amount: number | string;
}

export type DeleteCouponRequest = {
    couponId: string;
}

interface Stats {
    totalRevenue: number;
    revenueByMonth: {
        [key: string]: number;
    };
    revenueByWeek: {
        [key: string]: number;
    };
    revenueByDay: {
        [key: string]: number;
    };
    salesByCategory: {
        [key: string]: number;
    };
    bestSellingProducts: {
        productId: string;
        quantity: number;
    }[];
    userGenderDemographic: {
        _id: string;
        count: number;
    }[];
    totalOrders: number;
    latestOrders: Order[];
    totalProducts: number;
    totalCoupons: number;
}

// Stats
export interface StatsResponse {
    success: boolean;
    stats: Stats;
}



// -- Reducer Types --

// Cart Reducer Initial State
export interface CartReducerIntialState {
    loading: boolean;
    cartItems: CartItem[];
    subTotal: number;
    tax: number;
    total: number;
    shippingCharges: number;
    discount: number;
    shippingInfo: ShippingInfo;
}

export type CustomError = {
    status: number;
    data: {
        message: string;
        success: boolean;
    }
}

// Store Banners & Campaigns
export type BannerType = 'hero' | 'festival_banner' | 'showcase_banner' | 'announcement' | 'spotlight' | 'story_video';

export interface StoreBanner {
    id: string;
    type: BannerType;
    title: string;
    subtitle?: string;
    tagline?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    linkUrl?: string;
    buttonText?: string;
    badge?: string;
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BannersResponse {
    success: boolean;
    banners: StoreBanner[];
}

export interface BannerResponse {
    success: boolean;
    banner: StoreBanner;
    message?: string;
}
