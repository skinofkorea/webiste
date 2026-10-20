import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { useMyOrdersQuery } from '../redux/api/order.api';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';

const MyOrders: React.FC = () => {
    usePageSEO({
        title: 'Guest Orders | Skin of Korea',
        description: 'View and track guest orders placed on this device.',
        canonical: '/my-orders',
        noIndex: true,
    });

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Use guestUserId from localStorage for order tracking
    const guestUserId = localStorage.getItem('guestUserId') || '';

    const { data, isLoading, isError } = useMyOrdersQuery(guestUserId);

    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        const orderId = searchParams.get('orderId');
        if (paymentStatus === 'success') {
            notify('Payment successful! Your order has been placed.', 'success');
            if (orderId) {
                navigate(`/order/${orderId}`, { replace: true });
            } else {
                window.history.replaceState({}, '', window.location.pathname);
            }
        } else if (paymentStatus === 'fail') {
            notify('Payment failed or cancelled. Please try again.', 'error');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams, navigate]);

    if (!guestUserId) {
        return (
            <div className="container mx-auto my-8 p-4 bg-white rounded-lg shadow-md text-center">
                <BackButton fallback="/" />
                <h2 className="text-2xl font-bold mb-6">Guest orders</h2>
                <p className="text-gray-500">No guest orders found on this device yet. Place an order and it will appear here.</p>
            </div>
        );
    }

    if (isLoading) {
        return <p className="text-center text-lg">Loading...</p>;
    }

    if (isError || !data) {
        return <p className="text-center text-lg text-red-500">Error loading orders</p>;
    }

    return (
        <div className="container mx-auto my-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs max-w-5xl">
            <BackButton />
            <h2 className="text-2xl font-sans font-semibold tracking-tight mb-6 text-center text-[#111111]">Guest orders</h2>
            {data.orders.length === 0 ? (
                <p className="text-center text-sm text-neutral-500 py-8">No orders found</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50">
                            <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Total</th>
                                <th className="p-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-xs sm:text-sm">
                            {data.orders.map((order) => (
                                <tr className="hover:bg-neutral-50/50 transition-colors" key={order._id}>
                                    <td className="p-4 font-mono text-xs text-neutral-700">{order._id}</td>
                                    <td className="p-4 text-neutral-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold text-[#111111]">{formatStorePrice(order.total, order.currency || 'INR')}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            className="bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                                            onClick={() => navigate(`/order/${order._id}`)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
