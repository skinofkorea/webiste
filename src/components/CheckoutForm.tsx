import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from '../components/common/BackBtn';
import { useNewOrderMutation } from '../redux/api/order.api';
import { resetCart } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { NewOrderRequest } from '../types/api-types';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCreateOrderResponse {
  success: boolean;
  message?: string;
  order_id: string;
  amount: number;
  currency: string;
  key_id?: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutForm: React.FC = () => {
  usePageSEO({
    title: 'Checkout | Skin of Korea',
    description: 'Review your Skin of Korea order and complete checkout securely.',
    canonical: '/checkout',
    noIndex: true,
  });

  const dispatch = useDispatch();

  const {
    shippingInfo,
    cartItems,
    subTotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cart);

  const [newOrder] = useNewOrderMutation();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.some((item) => (item.currency || 'INR') !== 'GBP')) {
      notify('Your basket contains items from the previous INR store. Clear it before paying in GBP.', 'error');
      return;
    }
    if (cartItems.some((item) => item.productId.startsWith('demo-'))) {
      notify('Sample products are for preview only. Remove them from your basket before checkout.', 'error');
      return;
    }
    setIsProcessing(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      notify('Failed to load Razorpay SDK. Please check your internet connection.', 'error');
      setIsProcessing(false);
      return;
    }

    const guestUserId = 'guest_' + (shippingInfo.phone || Date.now());

    try {
      // 1. Initiate Razorpay Order creation on backend API
      const rzpOrderRes = await fetch('/api/v1/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'GBP',
          description: 'Skin of Korea order',
          customer_name: shippingInfo.name || 'Customer',
          customer_email: shippingInfo.email || '',
          customer_phone: shippingInfo.phone || '',
        }),
      });

      const rzpData = await rzpOrderRes.json() as RazorpayCreateOrderResponse;

      if (!rzpOrderRes.ok || !rzpData.success || !rzpData.order_id) {
        notify(rzpData?.message || 'Failed to initialize Razorpay checkout. Please try again.', 'error');
        setIsProcessing(false);
        return;
      }
      if (rzpData.currency !== 'GBP' || rzpData.amount !== Math.round(total * 100)) {
        notify('The payment gateway did not confirm GBP pricing. No payment was taken.', 'error');
        setIsProcessing(false);
        return;
      }

      const razorpayKey = rzpData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      if (!razorpayKey) {
        notify('Razorpay is not configured for GBP payments. Enable GBP/international payments and set the gateway keys.', 'error');
        setIsProcessing(false);
        return;
      }

      // 2. Launch Razorpay Modal Popup
      const options: RazorpayCheckoutOptions = {
        key: razorpayKey,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Skin of Korea',
        description: 'Authentic Korean skincare',
        image: '/images/skin-of-korea-logo.png',
        order_id: rzpData.order_id,
        handler: async (response) => {
          try {
            const verificationResponse = await fetch('/api/v1/payments/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verification = await verificationResponse.json() as { success: boolean; message?: string };
            if (!verificationResponse.ok || !verification.success) {
              throw new Error(verification.message || 'Payment signature verification failed.');
            }
          } catch (verificationError) {
            console.error('Razorpay payment verification failed:', verificationError);
            notify('We could not verify the payment. Your basket has been kept; please contact support before retrying.', 'error');
            setIsProcessing(false);
            return;
          }
          notify('Payment verified! Saving order...', 'success');

          const orderData: NewOrderRequest = {
            shippingCharges,
            shippingInfo: {
              ...shippingInfo,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              clientOrigin: window.location.origin,
            },
            tax,
            discount,
            total,
            currency: 'GBP',
            subTotal,
            orderItems: cartItems,
            userId: guestUserId,
          };

          try {
            const orderRes = await newOrder(orderData).unwrap();
            const createdOrderId = orderRes?.order?.id || orderRes?.order?._id || `ord_${Date.now()}`;

            localStorage.setItem('guestUserId', guestUserId);
            dispatch(resetCart());

            window.location.href = `/my-orders?payment=success&orderId=${createdOrderId}`;
          } catch (err: unknown) {
            console.error('Order save error after payment:', err);
            notify(`Payment was received, but the order could not be saved. Please contact hello@skinofkorea.com with payment reference ${response.razorpay_payment_id}.`, 'error');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            notify('Payment cancelled by customer.', 'info');
          },
        },
        prefill: {
          name: shippingInfo.name || '',
          email: shippingInfo.email || '',
          contact: shippingInfo.phone || '',
        },
        theme: {
          color: '#111111',
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout did not initialise.');
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      console.error('Razorpay Modal launching error:', error);
      notify(error instanceof Error ? error.message : 'Failed to launch Razorpay payment popup. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl mb-4">
        <BackButton fallback="/products" />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-neutral-200 max-w-xl w-full">
        {/* Merchant Branding Header */}
        <div className="flex flex-col items-center mb-6 text-center border-b border-neutral-200 pb-5">
          <img src="/images/skin-of-korea-logo.png" alt="Skin of Korea" className="h-14 w-auto object-contain mb-2" />
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-neutral-950">Skin of Korea</h1>
          <p className="text-xs text-neutral-500 mt-1">Secure Razorpay checkout</p>
        </div>

        {/* Customer Info Summary */}
        <div className="bg-neutral-50 p-4 rounded-xl mb-6 border border-neutral-200 text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-neutral-800 mb-2 uppercase tracking-wider text-xs">Shipping Summary:</p>
          <p className="font-medium text-neutral-900">{shippingInfo.name}</p>
          <p className="text-neutral-600">{shippingInfo.address}, {shippingInfo.city}{shippingInfo.state ? `, ${shippingInfo.state}` : ''} {shippingInfo.pinCode}, {shippingInfo.country}</p>
          <p className="text-neutral-600">Phone: {shippingInfo.phone}</p>
        </div>

        {/* Order Price Breakdown */}
        <div className="space-y-2 mb-6 border-b border-neutral-200 pb-4 text-xs sm:text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatStorePrice(subTotal, 'GBP')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-{formatStorePrice(discount, 'GBP')}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-600">
            <span>Shipping Charges</span>
            <span>{shippingCharges === 0 ? 'Free' : formatStorePrice(shippingCharges, 'GBP')}</span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-sans font-bold text-[#111111] pt-2 border-t border-neutral-100">
            <span>Total Payable</span>
            <span>{formatStorePrice(total, 'GBP')}</span>
          </div>
        </div>

        {/* Payment Submission Button */}
        <form onSubmit={submitHandler}>
          <button
            type="submit"
            disabled={isProcessing || cartItems.length === 0}
            className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all shadow-xs disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Opening Razorpay Modal...</span>
              </>
            ) : (
              <span>Pay securely with Razorpay ({formatStorePrice(total, 'GBP')}) ➔</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
