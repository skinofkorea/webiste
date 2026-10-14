import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/common/Loader';
import GlobalLoadingOverlay from './components/common/GlobalLoadingOverlay';


// Lazy load public components
const Layout = lazy(() => import('./components/layout/Layout'));
const ProductsPage = lazy(() => import('./pages/MiikoreanProductsPage'));
const HomePageMiikorean = lazy(() => import('./pages/MiikoreanHomePage'));
const MiikoreanProductPage = lazy(() => import('./pages/MiikoreanProductPage'));
const MiikoreanContentPage = lazy(() => import('./pages/MiikoreanContentPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutForm = lazy(() => import('./components/CheckoutForm'));
const Shipping = lazy(() => import('./pages/Shipping'));

// Lazy load admin components
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminAddProduct = lazy(() => import('./components/admin/AddProduct'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminFeaturedProducts = lazy(() => import('./pages/admin/FeaturedProduct'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminManageProduct = lazy(() => import('./components/admin/ManageProduct'));
const AdminOrderDetails = lazy(() => import('./pages/admin/AdmiOrderDetails'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Other pages
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
    return (
        <>
            <GlobalLoadingOverlay />
            <ToastContainer position="bottom-center" />
            <div className="flex flex-col min-h-screen">
                <Router>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<HomePageMiikorean />} />
                                <Route path="about" element={<Navigate to="/pages/about-us" replace />} />
                                <Route path="contact" element={<Navigate to="/pages/contact" replace />} />
                                <Route path="collections" element={<Navigate to="/pages/collections" replace />} />
                                <Route path="collections/:collectionHandle" element={<ProductsPage />} />
                                <Route path="products" element={<ProductsPage />} />
                                <Route path="category/:categorySlug" element={<ProductsPage />} />
                                <Route path="product/:productId" element={<MiikoreanProductPage />} />
                                <Route path="search" element={<ProductsPage />} />
                                <Route path="pages/:pageHandle" element={<MiikoreanContentPage />} />
                                <Route path="skin-analysis" element={<Navigate to="/pages/renude-analysis" replace />} />
                                <Route path="shipping-policy" element={<Navigate to="/pages/shipping-policy" replace />} />
                                <Route path="refund-policy" element={<Navigate to="/pages/return-policy" replace />} />
                                <Route path="terms" element={<a className="block p-10 text-center text-neutral-900 underline" href="https://www.miikorean.com/policies/terms-of-service">Read Mii Korean's terms of service</a>} />
                                <Route path="privacy" element={<a className="block p-10 text-center text-neutral-900 underline" href="https://www.miikorean.com/policies/privacy-policy">Read Mii Korean's privacy policy</a>} />
                                <Route path="track-shipment" element={<Navigate to="/my-orders" replace />} />
                                <Route path="cart" element={<CartPage />} />
                                <Route path="my-orders" element={<MyOrders />} />
                                <Route path="/order/:id" element={<OrderDetails />} />
                            </Route>

                            <Route path="shipping" element={<Shipping />} />
                            <Route path="checkout" element={<CheckoutForm />} />

                            {/* Admin Login - Public */}
                            <Route path="/admin/login" element={<AdminLogin />} />

                            {/* Protected Admin routes */}
                            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="banners" element={<AdminBanners />} />
                                <Route path="products" element={<AdminProducts />} />
                                <Route path="featured" element={<AdminFeaturedProducts />} />
                                <Route path="products/new" element={<AdminAddProduct />} />
                                <Route path="products/:productId" element={<AdminManageProduct />} />
                                <Route path="customers" element={<AdminCustomers />} />
                                <Route path="transactions" element={<AdminTransactions />} />
                                <Route path="coupons" element={<AdminCoupons />} />
                                <Route path="orders" element={<AdminOrders />} />
                                <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                            </Route>

                            {/* Fallback route */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </Router>
            </div>
        </>
    );
};

export default App;
