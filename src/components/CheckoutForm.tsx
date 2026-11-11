import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RevolutCheckout from '@revolut/checkout';
import BackButton from '../components/common/BackBtn';
import { useNewOrderMutation } from '../redux/api/order.api';
import { resetCart } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { NewOrderRequest } from '../types/api-types';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';
import { FaShieldHalved, FaLock, FaCreditCard, FaArrowUpRightFromSquare } from 'react-icons/fa6';

const CheckoutForm: React.FC = () => {
  usePageSEO({
    title: 'Checkout | Skin of Korea',
    description: 'Review your Skin of Korea order and complete checkout securely with Revolut.',
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
  const [initializing, setInitializing] = useState<boolean>(true);
  const [cardFieldReady, setCardFieldReady] = useState<boolean>(false);
  const [revolutConfigured, setRevolutConfigured] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardFieldRef = useRef<any>(null);
  const revolutInstanceRef = useRef<any>(null);

  // Stable primitives for dependency tracking
  const shippingEmail = shippingInfo?.email || '';
  const shippingName = shippingInfo?.name || '';
  const shippingPhone = shippingInfo?.phone || '';

  const saveOrderToDatabase = async (revolutOrderId: string, paymentMethod = 'revolut') => {
    setIsProcessing(true);
    const guestUserId = 'guest_' + (shippingInfo.phone || Date.now());

    const orderData: NewOrderRequest = {
      shippingCharges,
      shippingInfo: {
        ...shippingInfo,
        revolutOrderId,
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
      notify(`Order creation could not be completed. Please contact support@skinofkorea.co.uk with reference ${revolutOrderId}.`, 'error');
      setIsProcessing(false);
    }
  };

  // Initialize Revolut Order & Card Field
  useEffect(() => {
    if (cartItems.length === 0 || total <= 0) return;

    let isMounted = true;
    const initRevolut = async () => {
      try {
        setInitializing(true);
        setErrorMessage(null);

        const res = await fetch('/api/v1/payments/revolut/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            currency: 'GBP',
            customer_email: shippingEmail,
            customer_name: shippingName || 'Customer',
            metadata: {
              phone: shippingPhone,
              city: shippingInfo?.city || '',
            },
            redirect_url: `${window.location.origin}/my-orders`,
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.configured && data.token) {
          setRevolutConfigured(true);
          setOrderId(data.id);
          if (data.checkout_url) setCheckoutUrl(data.checkout_url);

          if (cardContainerRef.current) {
            cardContainerRef.current.innerHTML = '';
            const mode = (data.mode === 'sandbox' ? 'sandbox' : 'prod') as 'prod' | 'sandbox';
            const instance = await RevolutCheckout(data.token, mode);
            revolutInstanceRef.current = instance;

            const cardField = instance.createCardField({
              target: cardContainerRef.current,
              onSuccess: async () => {
                await saveOrderToDatabase(data.id, 'revolut');
              },
              onError: (err: any) => {
                console.error('Revolut payment error:', err);
                const msg = err?.message || 'Payment unsuccessful. Please check your card details.';
                setErrorMessage(msg);
                notify(msg, 'error');
                setIsProcessing(false);
              },
              onCancel: () => {
                notify('Payment was cancelled.', 'info');
                setIsProcessing(false);
              },
              onStatusChange: (status: any) => {
                if (status === 'completed' || status === 'valid') {
                  setErrorMessage(null);
                }
              },
            });

            cardFieldRef.current = cardField;
            if (isMounted) setCardFieldReady(true);
          }
        } else {
          setRevolutConfigured(false);
          if (data.mockOrderId) setOrderId(data.mockOrderId);
        }
      } catch (err: unknown) {
        console.warn('Revolut initialization notice:', err);
        if (isMounted) setRevolutConfigured(false);
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    initRevolut();

    return () => {
      isMounted = false;
      if (cardFieldRef.current && typeof cardFieldRef.current.destroy === 'function') {
        try {
          cardFieldRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [total, shippingEmail, shippingName, shippingPhone, cartItems.length]);

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFieldRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      cardFieldRef.current.submit({
        name: shippingName || undefined,
        email: shippingEmail || undefined,
      });
    } catch (err: any) {
      console.error('Revolut submit error:', err);
      const msg = err?.message || 'Failed to submit card payment.';
      setErrorMessage(msg);
      notify(msg, 'error');
      setIsProcessing(false);
    }
  };

  const handlePopupPay = () => {
    if (!revolutInstanceRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);

    revolutInstanceRef.current.payWithPopup({
      name: shippingName || undefined,
      email: shippingEmail || undefined,
      onSuccess: async () => {
        await saveOrderToDatabase(orderId, 'revolut_popup');
      },
      onError: (err: any) => {
        console.error('Revolut popup error:', err);
        const msg = err?.message || 'Payment was unsuccessful.';
        setErrorMessage(msg);
        notify(msg, 'error');
        setIsProcessing(false);
      },
      onCancel: () => {
        notify('Payment was cancelled.', 'info');
        setIsProcessing(false);
      },
    });
  };

  const handlePendingOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await saveOrderToDatabase(orderId || `rev_pending_${Date.now()}`, 'revolut_pending');
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
            <FaLock className="text-neutral-400 text-[10px]" /> Secure Revolut Checkout (GBP)
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
            <span>Preparing Revolut secure payment gateway…</span>
          </div>
        ) : revolutConfigured ? (
          <form onSubmit={handleCardPay} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Revolut Integrated Card Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Card Details
              </label>
              <div
                ref={cardContainerRef}
                className="min-h-[50px] rounded-xl border border-neutral-300 p-3 bg-white focus-within:border-neutral-900 transition-colors shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={!cardFieldReady || isProcessing}
              className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : !cardFieldReady ? (
                <span>Loading Payment Field...</span>
              ) : (
                <span>Pay securely with Revolut ({formatStorePrice(total, 'GBP')}) ➔</span>
              )}
            </button>

            {/* Alternative Revolut Pay / Hosted Checkout options */}
            <div className="pt-2 flex flex-col items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handlePopupPay}
                disabled={isProcessing}
                className="text-neutral-700 hover:text-black font-semibold underline text-xs"
              >
                Pay with Revolut Pay / Apple Pay / Google Pay
              </button>

              {checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-900 underline"
                >
                  <span>Open Revolut Hosted Checkout Page</span>
                  <FaArrowUpRightFromSquare className="text-[9px]" />
                </a>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs text-neutral-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <FaCreditCard className="text-neutral-900" />
                <span>Revolut Payment Gateway</span>
              </div>
              <p className="leading-relaxed text-neutral-600">
                Live card payments via Revolut (Revolut Pay, Apple Pay, Google Pay, Visa, Mastercard, Maestro) will activate as soon as merchant API keys are configured in your environment.
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
          <FaShieldHalved /> 256-Bit Encrypted Revolut Merchant Protection
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
