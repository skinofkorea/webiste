import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import BackButton from '../components/common/BackBtn';
import { resetCart } from '../redux/reducers/cart.reducer';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';
import { FaMagnifyingGlass, FaRotateRight } from 'react-icons/fa6';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  photo?: string;
}

interface OrderSummary {
  _id: string;
  short_id?: string;
  createdAt: string;
  status: string;
  total: number;
  currency?: string;
  orderItems?: OrderItem[];
}

const MyOrders: React.FC = () => {
  usePageSEO({
    title: 'Guest Orders | Skin of Korea',
    description: 'View and track guest orders placed on this device.',
    canonical: '/my-orders',
    noIndex: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [guestUserId, setGuestUserId] = useState<string>(() => localStorage.getItem('guestUserId') || '');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 1. Check for Revolut payment return params (_rp_oid, revolut_order_id, etc.)
  useEffect(() => {
    const revolutParam =
      searchParams.get('_rp_oid') ||
      searchParams.get('revolut_order_id') ||
      searchParams.get('order_id') ||
      localStorage.getItem('pendingRevolutOrderId');

    if (!revolutParam) return;

    let isMounted = true;
    const reconcileRevolutOrder = async () => {
      try {
        setIsVerifying(true);
        const pendingCheckoutStr = localStorage.getItem('pendingCheckout');
        let orderData = null;
        if (pendingCheckoutStr) {
          try {
            orderData = JSON.parse(pendingCheckoutStr);
          } catch {}
        }

        const res = await fetch('/api/v1/orders/complete-revolut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            revolutOrderId: revolutParam,
            orderData,
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.order) {
          // Clear cart immediately
          dispatch(resetCart());
          try {
            localStorage.removeItem('pendingCheckout');
            localStorage.removeItem('pendingRevolutOrderId');
            if (data.order.user_uid) {
              localStorage.setItem('guestUserId', data.order.user_uid);
              setGuestUserId(data.order.user_uid);
            }
          } catch {}

          notify('Payment confirmed! Your order has been placed.', 'success');
          const finalOrderId = data.order.id || data.order._id;
          if (finalOrderId) {
            navigate(`/order/${finalOrderId}?payment=success`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('Reconciliation error:', err);
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    reconcileRevolutOrder();

    return () => {
      isMounted = false;
    };
  }, [searchParams, dispatch, navigate]);

  // 2. Fetch orders for current guest user
  const fetchOrders = async (userId: string) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/orders/my?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (guestUserId) {
      fetchOrders(guestUserId);
    } else {
      setIsLoading(false);
    }
  }, [guestUserId]);

  // 3. Search orders by phone or email
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      setIsSearching(true);
      setSearchError(null);

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
      const param = isEmail ? `email=${encodeURIComponent(query)}` : `phone=${encodeURIComponent(query)}`;

      const res = await fetch(`/api/v1/orders/my?${param}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
        const resolvedUid = data.orders[0]?.user_uid || `guest_${query}`;
        setGuestUserId(resolvedUid);
        try {
          localStorage.setItem('guestUserId', resolvedUid);
        } catch {}
      } else {
        setSearchError(`No orders found matching "${query}". Please check your details.`);
      }
    } catch (err) {
      console.error('Order search error:', err);
      setSearchError('Could not search orders. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-4 sm:p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs max-w-5xl">
      <div className="mb-4">
        <BackButton fallback="/" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-[#111111]">
          Guest Orders
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Track and view all orders placed on Skin of Korea
        </p>
      </div>

      {/* Payment Verification Banner */}
      {isVerifying && (
        <div className="mb-6 p-4 rounded-xl bg-neutral-900 text-white text-xs flex items-center justify-center gap-3">
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span>Confirming your Revolut payment with merchant gateway...</span>
        </div>
      )}

      {/* Order Lookup Form */}
      <div className="bg-[#FAFAFA] p-4 sm:p-5 rounded-xl border border-neutral-200 mb-6 max-w-xl mx-auto">
        <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
          Find your order by phone or email
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 07919 464619 or name@example.com"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#111111] hover:bg-neutral-800 text-white font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:bg-neutral-400"
          >
            {isSearching ? <FaRotateRight className="animate-spin text-xs" /> : <FaMagnifyingGlass className="text-xs" />}
            <span>Find</span>
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-rose-600 mt-2 font-medium">{searchError}</p>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
          <span>Loading your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-4xl">📦</p>
          <p className="text-sm font-medium text-neutral-800">No orders found on this device</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            If you placed an order as a guest, enter the phone number or email you used at checkout above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50">
              <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="p-4">Reference</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs sm:text-sm">
              {orders.map((order) => (
                <tr className="hover:bg-neutral-50/50 transition-colors" key={order._id}>
                  <td className="p-4 font-mono text-xs font-medium text-neutral-900">
                    {order.short_id || order._id.slice(0, 10).toUpperCase()}
                  </td>
                  <td className="p-4 text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-[#111111]">
                    {formatStorePrice(order.total, order.currency || 'GBP')}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      className="bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      View Invoice ➔
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
