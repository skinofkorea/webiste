import React from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { useOrderDetailsQuery } from '../redux/api/order.api';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';
import { optimizeProductImageUrl } from '../utils/cloudinaryOptimize';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    usePageSEO({
        title: `Order #${id || ''} | Skin of Korea`,
        description: 'View order details and status.',
        canonical: `/order/${id || ''}`,
        noIndex: true,
    });

    const { data, isLoading, isError } = useOrderDetailsQuery(id!);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#FAFAFA]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-xs text-neutral-500 font-sans">Loading order invoice...</p>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAFAFA] p-4 text-center">
                <BackButton fallback="/my-orders" />
                <p className="text-4xl mb-3">📄</p>
                <h2 className="text-xl font-sans font-semibold text-[#111111] mb-2">Order Not Found</h2>
                <p className="text-xs text-neutral-500 max-w-sm mb-4">Could not find order details for ID: {id}</p>
            </div>
        );
    }

    const { order } = data;
    const currency = order.currency || 'INR';
    const formatPrice = (amount: number) => formatStorePrice(amount, currency);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'shipped':
                return 'bg-neutral-100 text-neutral-800 border-neutral-300';
            case 'processing':
                return 'bg-neutral-100 text-neutral-800 border-neutral-300';
            case 'delivered':
                return 'bg-black text-white border-black';
            default:
                return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-6 sm:py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <BackButton fallback="/my-orders" />

                <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xs border border-neutral-200 space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-neutral-200 gap-3">
                        <div>
                            <span className="text-xs font-mono text-neutral-400 block">ORDER RECEIPT</span>
                            <h1 className="text-lg sm:text-2xl font-sans font-semibold tracking-tight text-[#111111] break-all">ID: {order._id}</h1>
                            <p className="text-xs text-neutral-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString(currency === 'GBP' ? 'en-GB' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Shipping & Customer Details Card */}
                    <div className="bg-neutral-50 p-4 sm:p-5 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div>
                            <h3 className="font-semibold text-[#111111] text-xs uppercase tracking-wider mb-2">Delivery Address</h3>
                            <p className="font-medium text-neutral-900">{order.shippingInfo.address}</p>
                            <p className="text-neutral-600">{order.shippingInfo.city}, {order.shippingInfo.state} - {order.shippingInfo.pinCode}</p>
                            <p className="text-neutral-600">{order.shippingInfo.country}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#111111] text-xs uppercase tracking-wider mb-2">Customer Details</h3>
                            <p className="text-neutral-700">Phone: <span className="font-medium text-neutral-900">{order.shippingInfo.phone}</span></p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-base sm:text-lg font-sans font-semibold text-[#111111] mb-4">Order Items</h3>
                        
                        {/* Mobile Item Cards (Visible on small screens) */}
                        <div className="md:hidden space-y-3">
                            {order.orderItems.map((item, index) => (
                                <div key={item._id || index} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center gap-3">
                                    <img src={optimizeProductImageUrl(item.photo, 160)} alt={item.name} loading="lazy" decoding="async" className="h-14 w-14 object-contain rounded-lg bg-white p-1 border border-neutral-200 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-xs text-[#111111] truncate">{item.name}</p>
                                        <p className="text-xs text-neutral-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                        <p className="text-xs font-semibold text-neutral-900 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table (Hidden on small screens) */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-neutral-50">
                                    <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        <th className="p-4">Product</th>
                                        <th className="p-4">Quantity</th>
                                        <th className="p-4">Unit Price</th>
                                        <th className="p-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 text-sm">
                                    {order.orderItems.map((item, index) => (
                                        <tr className="hover:bg-neutral-50/50 transition-colors" key={item._id || `item-${index}`}>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <img src={optimizeProductImageUrl(item.photo, 160)} alt={item.name} loading="lazy" decoding="async" className="h-12 w-12 object-contain rounded-lg bg-white p-1 border border-neutral-200" />
                                                    <span className="font-semibold text-[#111111]">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-neutral-700">{item.quantity}</td>
                                            <td className="p-4 font-medium text-neutral-700">{formatPrice(item.price)}</td>
                                            <td className="p-4 font-semibold text-[#111111] text-right">{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary Box */}
                    <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-2 text-xs sm:text-sm">
                        <h3 className="font-sans font-semibold text-base text-[#111111] pb-2 border-b border-neutral-200">Payment Breakdown</h3>
                        <div className="flex justify-between text-neutral-600 pt-1">
                            <span>Subtotal</span>
                            <span className="font-semibold text-neutral-900">{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.tax > 0 && (
                            <div className="flex justify-between text-neutral-600">
                                <span>Taxes</span>
                                <span className="font-semibold text-neutral-900">{formatPrice(order.tax)}</span>
                            </div>
                        )}
                        {order.shippingCharges > 0 && (
                            <div className="flex justify-between text-neutral-600">
                                <span>Shipping Charges</span>
                                <span className="font-semibold text-neutral-900">{formatPrice(order.shippingCharges)}</span>
                            </div>
                        )}
                        {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                                <span>Discount</span>
                                <span>-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline font-bold text-base text-[#111111]">
                            <span>Total Paid</span>
                            <span className="text-xl sm:text-2xl font-extrabold">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
