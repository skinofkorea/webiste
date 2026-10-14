import React, { useEffect } from 'react';
import { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } from '../../redux/api/razorpay.api';
import { notify } from '../../utils/util';

interface RazorpayCheckoutProps {
  amount: number; // in paise (e.g., 50000 for ₹500)
  currency?: string;
  receipt?: string;
  description?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  onPaymentSuccess?: (paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onPaymentError?: (error: string) => void;
  buttonText?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  currency = 'INR',
  receipt = `order_${Date.now()}`,
  description = 'URVA purchase',
  customer_name = 'Guest',
  customer_email = '',
  customer_phone = '',
  onPaymentSuccess,
  onPaymentError,
  buttonText = 'Pay with Razorpay',
  buttonClassName = 'px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition',
  disabled = false,
}) => {
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateRazorpayOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyRazorpayPaymentMutation();

  // Load Razorpay script on component mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      notify('Failed to load Razorpay. Please refresh and try again.', 'error');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentClick = async () => {
    if (!amount || amount < 100) {
      notify('Invalid amount. Minimum ₹1 required.', 'error');
      if (onPaymentError) onPaymentError('Invalid amount');
      return;
    }

    if (!window.Razorpay) {
      notify('Razorpay is not loaded. Please refresh the page.', 'error');
      if (onPaymentError) onPaymentError('Razorpay not loaded');
      return;
    }

    try {
      // Step 1: Create order on backend
      console.log('📋 Creating Razorpay order...');
      const orderResponse = await createOrder({
        amount,
        currency,
        receipt,
        description,
        customer_name,
        customer_email,
        customer_phone,
      }).unwrap();

      if (!orderResponse.success || !orderResponse.order_id) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error('Razorpay Key ID not configured');
      }

      console.log('✅ Order created:', orderResponse.order_id);

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: razorpayKeyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        order_id: orderResponse.order_id,
        name: 'URVA',
        description: description,
        image: 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904965/urvaa/logo.png',
        customer_name: customer_name,
        customer_email: customer_email,
        customer_phone: customer_phone,
        handler: async (response: any) => {
          // Step 3: Payment successful - verify signature
          await handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment modal dismissed by user');
            notify('Payment cancelled', 'info');
            if (onPaymentError) onPaymentError('Payment cancelled');
          },
        },
        prefill: {
          name: customer_name,
          email: customer_email,
          contact: customer_phone,
        },
        theme: {
          color: '#111111',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response.error);
        notify(`Payment failed: ${response.error.description}`, 'error');
        if (onPaymentError) onPaymentError(response.error.description);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('❌ Error in payment process:', error.message);
      notify(error.message || 'Payment failed. Please try again.', 'error');
      if (onPaymentError) onPaymentError(error.message);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

    console.log('💳 Verifying payment signature...');

    try {
      // Verify payment signature on backend
      const verifyResponse = await verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }).unwrap();

      if (verifyResponse.success) {
        console.log('✅ Payment verified successfully!');
        notify('Payment successful! Thank you for your purchase.', 'success');
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          });
        }
      } else {
        throw new Error(verifyResponse.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error.message);
      notify(error.message || 'Payment verification failed. Please contact support.', 'error');
      if (onPaymentError) onPaymentError(error.message);
    }
  };

  return (
    <button
      onClick={handlePaymentClick}
      disabled={disabled || isCreatingOrder || isVerifying}
      className={buttonClassName}
      style={{
        opacity: disabled || isCreatingOrder || isVerifying ? 0.6 : 1,
        cursor: disabled || isCreatingOrder || isVerifying ? 'not-allowed' : 'pointer',
      }}
    >
      {isCreatingOrder || isVerifying ? (
        <>
          <span className="inline-block mr-2 animate-spin">⏳</span>
          Processing...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default RazorpayCheckout;
