import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import BackButton from '../components/common/BackBtn';
import { useNewOrderMutation } from '../redux/api/order.api';
import { resetCart } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { NewOrderRequest } from '../types/api-types';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';
import { FaShieldAlt, FaLock, FaCreditCard } from 'react-icons/fa';

interface StripePaymentFormProps {
  total: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  total,
  onSuccess,
  isProcessing,
  setIsProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-orders`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        notify(result.error.message || 'Payment failed. Please check your payment details.', 'error');
        setIsProcessing(false);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        await onSuccess(result.paymentIntent.id);
      } else {
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      console.error('Stripe confirmPayment error:', err);
      notify(err instanceof Error ? err.message : 'Payment error occurred.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <span>Pay securely with Stripe ({formatStorePrice(total, 'GBP')}) ➔</span>
        )}
      </button>
    </form>
  );
};

let stripePromiseCache: Promise<Stripe | null> | null = null;
function getStripePromise(key: string): Promise<Stripe | null> {
  if (!stripePromiseCache && key) {
    stripePromiseCache = loadStripe(key);
  }
  return stripePromiseCache || Promise.resolve(null);
}

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
  const [clientSecret, setClientSecret] = useState<string>('');
  const [stripeConfigured, setStripeConfigured] = useState<boolean>(false);
  const [stripeKey, setStripeKey] = useState<string>(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');
  const [initializing, setInitializing] = useState<boolean>(true);

  // Initialize Stripe PaymentIntent
  useEffect(() => {
    if (cartItems.length === 0) return;

    let isMounted = true;
    const initStripe = async () => {
      try {
        const res = await fetch('/api/v1/payments/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            currency: 'GBP',
            customer_email: shippingInfo.email || '',
            customer_name: shippingInfo.name || 'Customer',
            metadata: {
              phone: shippingInfo.phone || '',
              city: shippingInfo.city || '',
            },
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.configured && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setStripeConfigured(true);
          if (data.publicKey) setStripeKey(data.publicKey);
        } else {
          setStripeConfigured(false);
        }
      } catch (err) {
        console.warn('Stripe initialization notice:', err);
        if (isMounted) setStripeConfigured(false);
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    initStripe();
    return () => { isMounted = false; };
  }, [total, shippingInfo, cartItems.length]);

  const saveOrderToDatabase = async (paymentIntentId: string, paymentMethod = 'stripe') => {
    const guestUserId = 'guest_' + (shippingInfo.phone || Date.now());

    const orderData: NewOrderRequest = {
      shippingCharges,
      shippingInfo: {
        ...shippingInfo,
        stripePaymentIntentId: paymentIntentId,
        paymentMethod,
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
      console.error('Order save error:', err);
      notify(`Order creation could not be completed. Please contact hello@skinofkorea.co.uk with reference ${paymentIntentId}.`, 'error');
      setIsProcessing(false);
    }
  };

  const handlePendingOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await saveOrderToDatabase(`pi_pending_${Date.now()}`, 'stripe_pending');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl mb-4">
        <BackButton fallback="/shipping" />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-neutral-200 max-w-xl w-full">
        {/* Merchant Branding Header */}
        <div className="flex flex-col items-center mb-6 text-center border-b border-neutral-200 pb-5">
          <img src="/images/skin-of-korea-logo.png" alt="Skin of Korea" className="h-14 w-auto object-contain mb-2" />
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-neutral-950">Skin of Korea</h1>
          <p className="text-xs text-neutral-500 mt-1 flex items-center justify-center gap-1.5">
            <FaLock className="text-neutral-400 text-[10px]" /> Secure Stripe Checkout (GBP)
          </p>
        </div>

        {/* Customer Info Summary */}
        <div className="bg-neutral-50 p-4 rounded-xl mb-6 border border-neutral-200 text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-neutral-800 mb-2 uppercase tracking-wider text-xs">Delivery Address:</p>
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
            <span>Delivery</span>
            <span>{shippingCharges === 0 ? 'Free' : formatStorePrice(shippingCharges, 'GBP')}</span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-sans font-bold text-[#111111] pt-2 border-t border-neutral-100">
            <span>Total Payable</span>
            <span>{formatStorePrice(total, 'GBP')}</span>
          </div>
        </div>

        {/* Payment Section */}
        {initializing ? (
          <div className="py-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
            <span>Preparing secure payment gateway…</span>
          </div>
        ) : stripeConfigured && clientSecret && stripeKey ? (
          <Elements
            stripe={getStripePromise(stripeKey)}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#111111',
                  borderRadius: '12px',
                },
              },
            }}
          >
            <StripePaymentForm
              total={total}
              onSuccess={saveOrderToDatabase}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </Elements>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs text-neutral-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <FaCreditCard className="text-[#363070]" />
                <span>Stripe Payment Gateway</span>
              </div>
              <p className="leading-relaxed text-neutral-600">
                Live card payments via Stripe (Apple Pay, Google Pay, Visa, Mastercard, Klarna) will activate as soon as merchant API keys are provided.
              </p>
            </div>

            <form onSubmit={handlePendingOrderSubmit}>
              <button
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <span>Complete Order ({formatStorePrice(total, 'GBP')}) ➔</span>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
          <FaShieldAlt /> 256-Bit Encrypted Secure Checkout
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
