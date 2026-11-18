import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RevolutCheckout from '@revolut/checkout';
import BackButton from '../components/common/BackBtn';
import { useNewOrderMutation } from '../redux/api/order.api';
import { calculatePrice, resetCart, computeCartTotals } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { NewOrderRequest } from '../types/api-types';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';
import { FaShieldHalved, FaLock, FaArrowUpRightFromSquare, FaRotateRight, FaBagShopping } from 'react-icons/fa6';

interface RevolutOrderInfo {
  id: string;
  token: string;
  checkoutUrl?: string;
  mode?: 'prod' | 'sandbox';
}

const CheckoutForm: React.FC = () => {
  usePageSEO({
    title: 'Checkout | Skin of Korea',
    description: 'Review your Skin of Korea order and complete checkout securely with Revolut.',
    canonical: '/checkout',
    noIndex: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    shippingInfo,
    cartItems,
    subTotal,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cart);

  // Synchronously compute fallback totals from cartItems so totals are never 0 on mount or page refresh
  const fallbackTotals = useMemo(() => computeCartTotals(cartItems, discount), [cartItems, discount]);
  const effectiveSubTotal = subTotal > 0 ? subTotal : fallbackTotals.subTotal;
  const effectiveShipping = shippingCharges > 0 || effectiveSubTotal >= 35 ? shippingCharges : fallbackTotals.shippingCharges;
  const effectiveDiscount = discount > 0 ? discount : fallbackTotals.discount;
  const effectiveTotal = total > 0 ? total : fallbackTotals.total;

  const [newOrder] = useNewOrderMutation();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [cardReady, setCardReady] = useState<boolean>(false);
  const [walletMethod, setWalletMethod] = useState<'applePay' | 'googlePay' | null>(null);
  const [revolutPayReady, setRevolutPayReady] = useState<boolean>(false);
  const [orderInfo, setOrderInfo] = useState<RevolutOrderInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const walletContainerRef = useRef<HTMLDivElement>(null);
  const revolutPayContainerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardFieldRef = useRef<any>(null);
  const paymentRequestRef = useRef<any>(null);
  const revolutInstanceRef = useRef<any>(null);

  // Synchronize Redux cart totals on mount
  useEffect(() => {
    dispatch(calculatePrice());
  }, [dispatch]);

  // Guard against empty cart or missing address: redirect immediately to prevent stuck checkout
  useEffect(() => {
    if (cartItems.length === 0) {
      notify('Your basket is empty. Please add items before checkout.', 'info');
      navigate('/cart', { replace: true });
      return;
    }
    if (!shippingInfo?.address || !shippingInfo?.pinCode) {
      notify('Please enter your delivery address first.', 'info');
      navigate('/shipping', { replace: true });
      return;
    }
  }, [cartItems.length, shippingInfo?.address, shippingInfo?.pinCode, navigate]);

  // Stable primitives for dependency tracking
  const shippingEmail = shippingInfo?.email || '';
  const shippingName = shippingInfo?.name || '';
  const shippingPhone = shippingInfo?.phone || '';

  // 1. Fetch Revolut Order Token from Backend
  useEffect(() => {
    if (cartItems.length === 0) {
      setInitializing(false);
      return;
    }

    if (effectiveTotal <= 0) {
      setInitializing(false);
      setErrorMessage('Your bag total is £0.00. Please add items to your basket.');
      return;
    }

    let isMounted = true;
    const createOrder = async () => {
      try {
        setInitializing(true);
        setErrorMessage(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch('/api/v1/payments/revolut/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            amount: Math.round(effectiveTotal * 100),
            currency: 'GBP',
            customer_email: shippingEmail,
            customer_name: shippingName || 'Customer',
            metadata: {
              phone: shippingPhone,
              city: shippingInfo?.city || '',
            },
            redirect_url: 'https://skinofkorea.co.uk/my-orders',
          }),
        });

        clearTimeout(timeoutId);
        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.configured && data.token) {
          setOrderInfo({
            id: data.id,
            token: data.token,
            checkoutUrl: data.checkout_url,
            mode: (data.mode === 'sandbox' ? 'sandbox' : 'prod'),
          });

          // Pre-save checkout details in localStorage so if the browser redirects (3DS, Apple Pay, Revolut Pay),
          // the order can be completed immediately upon return
          const guestUserId = 'guest_' + (shippingPhone || Date.now());
          try {
            localStorage.setItem('pendingCheckout', JSON.stringify({
              shippingCharges: effectiveShipping,
              shippingInfo: {
                ...shippingInfo,
                revolutOrderId: data.id,
              },
              tax: 0,
              discount: effectiveDiscount,
              total: effectiveTotal,
              currency: 'GBP',
              subTotal: effectiveSubTotal,
              orderItems: cartItems,
              userId: guestUserId,
            }));
            localStorage.setItem('pendingRevolutOrderId', data.id);
            localStorage.setItem('guestUserId', guestUserId);
          } catch (e) {
            console.error('Failed to pre-save pending checkout', e);
          }
        } else {
          setErrorMessage(data.message || 'Unable to connect to the Revolut payment gateway.');
        }
      } catch (err: unknown) {
        console.error('Revolut initialization error:', err);
        if (isMounted) {
          const isAbort = (err as any)?.name === 'AbortError';
          setErrorMessage(isAbort ? 'Connecting to Revolut timed out. Please tap retry.' : 'Failed to connect to the Revolut payment service. Please try again.');
        }
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    createOrder();

    return () => {
      isMounted = false;
    };
  }, [effectiveTotal, shippingEmail, shippingName, shippingPhone, cartItems.length, retryTrigger]);

  // 2. Mount Revolut Payment Methods (Apple Pay / Google Pay, Revolut Pay, Card Field)
  useEffect(() => {
    if (!orderInfo?.token || !cardContainerRef.current) return;

    let isMounted = true;
    const mountCheckout = async () => {
      try {
        setCardReady(false);
        setWalletMethod(null);
        setRevolutPayReady(false);

        if (cardContainerRef.current) cardContainerRef.current.innerHTML = '';
        if (walletContainerRef.current) walletContainerRef.current.innerHTML = '';
        if (revolutPayContainerRef.current) revolutPayContainerRef.current.innerHTML = '';

        const mode = orderInfo.mode || 'prod';
        const instance = await RevolutCheckout(orderInfo.token, mode);
        if (!isMounted) return;
        revolutInstanceRef.current = instance;

        // 1. Mount Payment Request (Native Apple Pay on Safari iOS/macOS, Google Pay on Chrome)
        if (walletContainerRef.current && typeof instance.paymentRequest === 'function') {
          try {
            const pr = instance.paymentRequest({
              target: walletContainerRef.current,
              buttonStyle: {
                size: 'large',
                radius: 'large',
                variant: 'dark',
                height: '48px',
              },
              onSuccess: async () => {
                await saveOrderToDatabase(orderInfo.id, 'wallet_payment');
              },
              onError: (err: any) => {
                console.error('Digital wallet payment error:', err);
                const msg = err?.message || 'Payment unsuccessful with digital wallet.';
                setErrorMessage(msg);
                notify(msg, 'error');
                setIsProcessing(false);
              },
              onCancel: () => {
                setIsProcessing(false);
              },
            });

            paymentRequestRef.current = pr;

            // Check if Apple Pay or Google Pay is available in the user's browser
            const method = await pr.canMakePayment();
            if (isMounted && method) {
              setWalletMethod(method);
              await pr.render();
            }
          } catch (prErr) {
            console.warn('PaymentRequest not supported or setup error:', prErr);
          }
        }

        // 2. Mount 1-Click Revolut Pay
        if (revolutPayContainerRef.current && typeof instance.revolutPay === 'function') {
          try {
            instance.revolutPay({
              target: revolutPayContainerRef.current,
              phone: shippingPhone || undefined,
              email: shippingEmail || undefined,
              buttonStyle: {
                size: 'large',
                radius: 'large',
                variant: 'light-outlined',
                height: '48px',
              },
              onSuccess: async () => {
                await saveOrderToDatabase(orderInfo.id, 'revolut_pay');
              },
              onError: (err: any) => {
                console.error('Revolut Pay error:', err);
                const msg = err?.message || 'Revolut Pay payment unsuccessful.';
                setErrorMessage(msg);
                notify(msg, 'error');
                setIsProcessing(false);
              },
              onCancel: () => {
                setIsProcessing(false);
              },
            });
            if (isMounted) setRevolutPayReady(true);
          } catch (rpErr) {
            console.warn('RevolutPay setup warning:', rpErr);
          }
        }

        // 3. Mount Inline Card Field
        if (cardContainerRef.current && typeof instance.createCardField === 'function') {
          const cardField = instance.createCardField({
            target: cardContainerRef.current!,
            onSuccess: async () => {
              // ONLY triggered after Revolut successfully charges and captures the card
              await saveOrderToDatabase(orderInfo.id, 'revolut_card');
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
          if (isMounted) setCardReady(true);
        }
      } catch (err: any) {
        console.error('Revolut mount error:', err);
        if (isMounted) {
          setErrorMessage('Could not load payment options. You can still complete payment with the hosted Revolut link.');
        }
      }
    };

    mountCheckout();

    return () => {
      isMounted = false;
      if (cardFieldRef.current && typeof cardFieldRef.current.destroy === 'function') {
        try {
          cardFieldRef.current.destroy();
        } catch {}
      }
      if (paymentRequestRef.current && typeof paymentRequestRef.current.destroy === 'function') {
        try {
          paymentRequestRef.current.destroy();
        } catch {}
      }
    };
  }, [orderInfo]);

  const saveOrderToDatabase = async (revolutOrderId: string, paymentMethod = 'revolut') => {
    setIsProcessing(true);
    const guestUserId = 'guest_' + (shippingInfo.phone || Date.now());

    const orderData: NewOrderRequest = {
      shippingCharges: effectiveShipping,
      shippingInfo: {
        ...shippingInfo,
        revolutOrderId,
        paymentMethod,
        clientOrigin: window.location.origin,
      },
      tax: 0,
      discount: effectiveDiscount,
      total: effectiveTotal,
      currency: 'GBP',
      subTotal: effectiveSubTotal,
      orderItems: cartItems,
      userId: guestUserId,
    };

    try {
      const res = await fetch('/api/v1/orders/complete-revolut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revolutOrderId, orderData }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment confirmation failed');
      }

      const createdOrderId = data?.order?.id || data?.order?._id || `ord_${Date.now()}`;
      try {
        localStorage.setItem('guestUserId', guestUserId);
        localStorage.removeItem('pendingCheckout');
        localStorage.removeItem('pendingRevolutOrderId');
      } catch {}

      dispatch(resetCart());
      window.location.href = `/order/${createdOrderId}?payment=success`;
    } catch (err: unknown) {
      console.warn('complete-revolut fallback to newOrder:', err);
      try {
        const orderRes = await newOrder(orderData).unwrap();
        const createdOrderId = orderRes?.order?.id || orderRes?.order?._id || `ord_${Date.now()}`;

        try {
          localStorage.setItem('guestUserId', guestUserId);
          localStorage.removeItem('pendingCheckout');
          localStorage.removeItem('pendingRevolutOrderId');
        } catch {}
        dispatch(resetCart());

        window.location.href = `/order/${createdOrderId}?payment=success`;
      } catch (fallbackErr: any) {
        console.error('Order save error:', fallbackErr);
        const apiMsg = fallbackErr?.data?.message || (err as any)?.message || 'Order creation failed. Please contact support@skinofkorea.co.uk.';
        notify(apiMsg, 'error');
        setErrorMessage(apiMsg);
        setIsProcessing(false);
      }
    }
  };

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFieldRef.current || !cardReady) return;
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl mb-4">
        <BackButton fallback="/shipping" />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-neutral-200 max-w-xl w-full">
        {/* Merchant Branding Header */}
        <div className="flex flex-col items-center mb-6 text-center border-b border-neutral-200 pb-5">
          <img src="/images/skin-of-korea-logo.png" alt="Skin of Korea" className="h-9 sm:h-11 w-auto max-w-[260px] object-contain mb-2" />
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-neutral-950">Skin of Korea</h1>
          <p className="text-xs text-neutral-500 mt-1 flex items-center justify-center gap-1.5">
            <FaLock className="text-neutral-400 text-[10px]" /> Secure Revolut Checkout (GBP)
          </p>
        </div>

        {/* Customer Info Summary */}
        <div className="bg-neutral-50 p-4 rounded-xl mb-6 border border-neutral-200 text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-neutral-800 mb-2 uppercase tracking-wider text-xs">Delivery Address:</p>
          <p className="font-medium text-neutral-900">{shippingInfo?.name || 'Customer'}</p>
          <p className="text-neutral-600">
            {shippingInfo?.address}, {shippingInfo?.city}{shippingInfo?.state ? `, ${shippingInfo?.state}` : ''} {shippingInfo?.pinCode}, {shippingInfo?.country}
          </p>
          <p className="text-neutral-600">Phone: {shippingInfo?.phone || 'Not provided'}</p>
        </div>

        {/* Order Price Breakdown */}
        <div className="space-y-2 mb-6 border-b border-neutral-200 pb-4 text-xs sm:text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatStorePrice(effectiveSubTotal, 'GBP')}</span>
          </div>
          {effectiveDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-{formatStorePrice(effectiveDiscount, 'GBP')}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-600">
            <span>Delivery</span>
            <span>{effectiveShipping === 0 ? 'Free' : formatStorePrice(effectiveShipping, 'GBP')}</span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-sans font-bold text-[#111111] pt-2 border-t border-neutral-100">
            <span>Total Payable</span>
            <span>{formatStorePrice(effectiveTotal, 'GBP')}</span>
          </div>
        </div>

        {/* Payment Section */}
        {initializing ? (
          <div className="py-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
            <span>Connecting to Revolut secure gateway…</span>
          </div>
        ) : orderInfo ? (
          <form onSubmit={handleCardPay} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* 1. Native Digital Wallet: Apple Pay (Safari iOS/macOS) / Google Pay (Chrome) */}
            <div
              ref={walletContainerRef}
              className={`w-full overflow-hidden rounded-xl transition-all ${walletMethod ? 'block mb-3' : 'hidden'}`}
              style={{ minHeight: walletMethod ? '48px' : '0px' }}
            />

            {/* 2. Official 1-Click Revolut Pay Button */}
            <div
              ref={revolutPayContainerRef}
              className={`w-full overflow-hidden rounded-xl transition-all ${revolutPayReady ? 'block mb-3' : 'hidden'}`}
              style={{ minHeight: revolutPayReady ? '48px' : '0px' }}
            />

            {/* Visual Divider if 1-click payment methods are available */}
            {(walletMethod || revolutPayReady) && (
              <div className="relative py-2 flex items-center justify-center my-3">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-neutral-400 uppercase tracking-wider absolute">
                  or pay with card
                </span>
              </div>
            )}

            {/* 3. Revolut Integrated Card Field */}
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
              disabled={!cardReady || isProcessing}
              className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment with Revolut...</span>
                </>
              ) : !cardReady ? (
                <span>Loading Payment Field...</span>
              ) : (
                <span>Pay {formatStorePrice(effectiveTotal, 'GBP')} with Card ➔</span>
              )}
            </button>

            {orderInfo.checkoutUrl && (
              <div className="pt-2 flex justify-center">
                <a
                  href={orderInfo.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-900 underline"
                >
                  <span>Or pay on Revolut's secure hosted page</span>
                  <FaArrowUpRightFromSquare className="text-[9px]" />
                </a>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-1 text-center">
              <p className="font-semibold">Unable to initiate payment</p>
              <p>{errorMessage || 'Could not connect to the Revolut payment gateway. Please check your basket and try again.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRetryTrigger((c) => c + 1)}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <FaRotateRight className="text-xs" />
                <span>Retry Connection</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <FaBagShopping className="text-xs" />
                <span>Return to Bag</span>
              </button>
            </div>
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
