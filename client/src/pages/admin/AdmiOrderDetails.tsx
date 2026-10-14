import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../../components/common/BackBtn';
import { useDeleteOrderMutation, useOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../redux/api/order.api';
import { notify } from '../../utils/util';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { formatStorePrice } from '../../data/miikoreanStorefront';

const AdminOrderDetails: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { data, isLoading, isError, refetch } = useOrderDetailsQuery(orderId!);
    const [updateOrderStatus] = useUpdateOrderStatusMutation();
    const [deleteOrder] = useDeleteOrderMutation();
    const navigate = useNavigate();

    // Tracking Modal State
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [awbNumber, setAwbNumber] = useState('');
    const [senderMobile, setSenderMobile] = useState('');
    const [receiverMobile, setReceiverMobile] = useState(data?.order?.shippingInfo?.phone || '');

    const handleStatusChange = (status: string) => {
        // If status is "Shipped", show tracking modal
        if (status === 'Shipped') {
            setSelectedStatus(status);
            setReceiverMobile(data?.order?.shippingInfo?.phone || '');
            setShowTrackingModal(true);
        } else {
            // For other statuses, update directly
            handleStatusUpdate(status);
        }
    };

    const handleStatusUpdate = async (status: string, trackingData?: { awbNumber: string; senderMobile: string; receiverMobile: string }) => {
        try {
            const updatePayload: any = { 
                orderId: orderId!, 
                status 
            };
            
            // Add tracking data if provided
            if (trackingData) {
                updatePayload.awbNumber = trackingData.awbNumber;
                updatePayload.senderMobile = trackingData.senderMobile;
                updatePayload.receiverMobile = trackingData.receiverMobile;
            }

            await updateOrderStatus(updatePayload).unwrap();
            notify('Order status updated successfully', 'success');
            refetch();
        } catch (error) {
            notify('Failed to update order status', 'error');
        }
    };

    const handleTrackingSubmit = () => {
        // Validate inputs
        if (!awbNumber.trim()) {
            notify('Please enter AWB Number', 'error');
            return;
        }
        if (!senderMobile.trim() || senderMobile.length !== 10) {
            notify('Please enter valid 10-digit Sender Mobile Number', 'error');
            return;
        }
        if (!receiverMobile.trim() || receiverMobile.length !== 10) {
            notify('Please enter valid 10-digit Receiver Mobile Number', 'error');
            return;
        }

        // Update status with tracking data
        handleStatusUpdate(selectedStatus, {
            awbNumber: awbNumber.trim(),
            senderMobile: senderMobile.trim(),
            receiverMobile: receiverMobile.trim()
        });

        // Close modal and reset
        setShowTrackingModal(false);
        setAwbNumber('');
        setSenderMobile('');
        setReceiverMobile('');
    };

    const handleDeleteOrder = async () => {
        try {
            await deleteOrder(orderId!).unwrap();
            notify('Order deleted successfully', 'success');
            navigate('/admin/orders');
        } catch (error) {
            notify('Failed to delete order', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'dispatched':
                return 'bg-purple-50 text-purple-700 border border-purple-200';
            case 'shipped':
                return 'bg-green-50 text-green-700 border border-green-200';
            case 'processing':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'delivered':
                return 'bg-blue-50 text-blue-700 border border-blue-200';
            default:
                return 'bg-gray-50 text-gray-600 border border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="loader"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-xs max-w-md mx-auto font-sans">
                <p className="text-red-600 font-semibold mb-2 text-sm">Error loading order details</p>
                <p className="text-xs text-neutral-500">Could not find or retrieve order data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <BackButton fallback="/admin/orders" />
                <div>
                    <span className="text-xs text-neutral-400 font-mono">ID: {data?.order?._id}</span>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-2xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-100 pb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Order Information</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Review client information, total purchase value, and items list.</p>
                    </div>
                    <div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(data?.order?.status || '')}`}>
                            {data?.order?.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                        <strong className="block text-[10px] uppercase text-neutral-400 mb-1 tracking-wider font-semibold">Customer Details</strong>
                        <span className="text-neutral-900 font-semibold block text-sm">
                            {data?.order?.shippingInfo?.name || (typeof data?.order?.user === 'object' ? (data?.order?.user as any)?.name : '') || data?.order?.shippingInfo?.email?.split('@')[0] || 'Customer'}
                        </span>
                        <span className="text-neutral-500 text-xs block font-mono mt-0.5">
                            {data?.order?.shippingInfo?.email || (typeof data?.order?.user === 'object' ? (data?.order?.user as any)?.email : '') || 'N/A'}
                        </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                        <strong className="block text-[10px] uppercase text-neutral-400 mb-1 tracking-wider font-semibold">Total Value</strong>
                        <span className="text-neutral-900 font-bold text-lg block">{formatStorePrice(data?.order?.total || 0, data?.order?.currency || 'INR')}</span>
                        <span className="text-neutral-500 text-[11px] block mt-0.5">Inclusive of taxes & delivery</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                        <strong className="block text-[10px] uppercase text-neutral-400 mb-1 tracking-wider font-semibold">Shipping Details</strong>
                        <span className="text-neutral-900 block font-medium text-xs leading-relaxed">
                            {data?.order?.shippingInfo?.address || 'N/A'}, {data?.order?.shippingInfo?.city || 'N/A'}
                        </span>
                        <span className="text-neutral-500 text-[11px] block mt-1">
                            PIN: {data?.order?.shippingInfo?.pinCode || 'N/A'} | Mob: {data?.order?.shippingInfo?.phone || 'N/A'}
                        </span>

                        {/* GPS Coordinates & Google Maps Link */}
                        {data?.order?.shippingInfo?.latitude && data?.order?.shippingInfo?.longitude ? (
                            <div className="mt-3 pt-2 border-t border-neutral-200 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-neutral-800 font-semibold">
                                    <span>📍 GPS:</span>
                                    <span className="font-mono text-neutral-600 text-[11px]">
                                        {data.order.shippingInfo.latitude.toFixed(5)}, {data.order.shippingInfo.longitude.toFixed(5)}
                                    </span>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${data.order.shippingInfo.latitude},${data.order.shippingInfo.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline mt-1"
                                >
                                    🗺️ Open on Google Maps ➔
                                </a>
                            </div>
                        ) : data?.order?.shippingInfo?.landmark ? (
                            <span className="text-xs text-neutral-500 block mt-1">
                                Landmark: {data.order.shippingInfo.landmark}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-neutral-900 mb-3">Order Items</h3>
                    <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                        <table className="min-w-full divide-y divide-neutral-100 text-left">
                            <thead className="bg-neutral-50 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3">Quantity</th>
                                    <th className="px-5 py-3">Unit Price</th>
                                    <th className="px-5 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100 text-xs">
                                {data?.order.orderItems.map((item) => (
                                    <tr key={item.productId} className="hover:bg-neutral-50/70 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-neutral-900">{item.name}</td>
                                        <td className="px-5 py-3.5 text-neutral-700 font-medium">{item.quantity} units</td>
                                        <td className="px-5 py-3.5 text-neutral-500">{formatStorePrice(item.price, data?.order?.currency || 'INR')}</td>
                                        <td className="px-5 py-3.5 font-bold text-neutral-900">{formatStorePrice(item.quantity * item.price, data?.order?.currency || 'INR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Update Status:</label>
                        <select
                            className="border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none rounded-xl p-2.5 bg-white text-xs font-semibold text-neutral-900 cursor-pointer"
                            value={data?.order?.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    <button
                        onClick={handleDeleteOrder}
                        className="inline-flex items-center gap-2 text-rose-600 border border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-xl font-semibold text-xs transition"
                    >
                        <FaTrash size={11} /> Delete Order Record
                    </button>
                </div>

                {/* Display Tracking Info if Available */}
                {data?.order?.awbNumber && (
                    <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                        <h4 className="text-xs font-bold text-neutral-900 mb-2">📦 Shipment Tracking Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                                <span className="text-neutral-500 font-medium text-[11px]">AWB Number:</span>
                                <p className="text-neutral-900 font-mono font-semibold mt-0.5">{data.order.awbNumber}</p>
                            </div>
                            <div>
                                <span className="text-neutral-500 font-medium text-[11px]">Sender Mobile:</span>
                                <p className="text-neutral-900 font-mono font-semibold mt-0.5">{data.order.senderMobile}</p>
                            </div>
                            <div>
                                <span className="text-neutral-500 font-medium text-[11px]">Receiver Mobile:</span>
                                <p className="text-neutral-900 font-mono font-semibold mt-0.5">{data.order.receiverMobile}</p>
                            </div>
                        </div>
                        {data.order.trackingUrl && (
                            <a 
                                href={data.order.trackingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mt-3 text-neutral-900 hover:underline text-xs font-semibold"
                            >
                                🔗 Track Shipment Online
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Tracking Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200">
                        <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                            <h3 className="text-base font-bold text-neutral-900">📦 Enter Shipment Tracking Details</h3>
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="text-neutral-400 hover:text-neutral-600 transition"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>
                        
                        <p className="text-xs text-neutral-500 mb-4">
                            Provide the carrier AWB number and mobile numbers to enable live shipment tracking.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
                                    AWB Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., 79732207"
                                    value={awbNumber}
                                    onChange={(e) => setAwbNumber(e.target.value)}
                                    className="w-full border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none rounded-xl p-2.5 text-xs font-mono bg-neutral-50 focus:bg-white text-neutral-900"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
                                    Sender Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    value={senderMobile}
                                    onChange={(e) => setSenderMobile(e.target.value.replace(/\D/g, ''))}
                                    className="w-full border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none rounded-xl p-2.5 text-xs font-mono bg-neutral-50 focus:bg-white text-neutral-900"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
                                    Receiver Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    value={receiverMobile}
                                    onChange={(e) => setReceiverMobile(e.target.value.replace(/\D/g, ''))}
                                    className="w-full border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none rounded-xl p-2.5 text-xs font-mono bg-neutral-50 focus:bg-white text-neutral-900"
                                />
                                <p className="text-[10px] text-neutral-400 mt-1">Pre-filled from order details</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="flex-1 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2.5 rounded-xl font-semibold text-xs transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrackingSubmit}
                                className="flex-1 bg-[#111111] text-white hover:bg-neutral-800 px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-xs"
                            >
                                Save & Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetails;
