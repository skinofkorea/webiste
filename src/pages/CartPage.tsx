import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { useApplyCouponMutation } from '../redux/api/coupon.api';
import { calculatePrice, decrementCartItem, discountApplied, incrementCartItem, removeCartItem, resetCart, saveShippingInfo } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { notify } from '../utils/util';
import { usePageSEO } from '../hooks/usePageSEO';
import { formatStorePrice } from '../data/storefront';
import { optimizeProductImageUrl } from '../utils/cloudinaryOptimize';

const Cart: React.FC = () => {
  usePageSEO({
    title: 'Your Bag | Skin of Korea',
    description: 'Review your Skin of Korea basket before checkout.',
    canonical: '/cart',
    noIndex: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, subTotal, total, discount, shippingCharges, shippingInfo } = useSelector((state: RootState) => state.cart);
  const hasDemoItems = cartItems.some((item) => item.productId.startsWith('demo-'));
  const hasLegacyCurrency = cartItems.some((item) => (item.currency || 'INR') !== 'GBP');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems, dispatch, discount]);

  const handleIncrement = (productId: string) => {
    dispatch(incrementCartItem(productId));
  };

  const handleDecrement = (productId: string) => {
    dispatch(decrementCartItem(productId));
  };

  const handleRemove = (productId: string) => {
    dispatch(removeCartItem(productId));
  };

  const handleClearCart = () => {
    dispatch(resetCart());
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const response = await applyCoupon({ code: couponCode }).unwrap();
      if (response.coupon.amount > subTotal) {
        notify('This coupon discount is greater than your basket subtotal.', 'error');
        return;
      }
      dispatch(discountApplied(response.coupon.amount));
      setAppliedCoupon(couponCode);
      setCouponCode('');
      notify('Coupon applied successfully!', 'success');
    } catch (error) {
      notify('Invalid coupon code', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(discountApplied(0));
    setAppliedCoupon('');
    notify('Coupon removed', 'info');
  };

  const getPhotoUrl = (photoUrl?: string) => {
    if (!photoUrl) return '/images/skin-of-korea-logo.png';
    return optimizeProductImageUrl(photoUrl, 160);
  };

  const productPath = (productId: string) => `/product/${productId.split('__')[0]}`;
  const cartCurrency = cartItems[0]?.currency || 'INR';

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-6 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton fallback="/products" />

        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xs border border-neutral-200">
          <h1 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-neutral-950 mb-6">Your bag</h1>

          {cartItems.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-5xl">🧺</p>
              <h2 className="text-xl font-sans font-semibold text-[#111111]">Your basket is currently empty</h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto font-light">
              Your bag is waiting for something worth discovering.
              </p>
              <Link
                to="/products"
                className="inline-block bg-black hover:bg-neutral-800 text-white font-medium px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs mt-2"
              >
                Browse All Products ➔
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column - Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Mobile Cards (Visible below md) */}
                <div className="md:hidden space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="bg-[#FAFAFA] p-4 rounded-xl border border-neutral-200 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={item.productId.startsWith('demo-') ? '/products' : productPath(item.productId)}
                          className="flex-shrink-0"
                        >
                          <img
                            src={getPhotoUrl(item.photo)}
                            alt={item.name}
                            className="h-16 w-16 object-contain rounded-lg bg-white p-1 border border-neutral-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/skin-of-korea-logo.png';
                            }}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={item.productId.startsWith('demo-') ? '/products' : productPath(item.productId)}>
                            <h3 className="font-semibold text-sm text-[#111111] truncate">{item.name}</h3>
                          </Link>
                          <p className="text-xs text-neutral-500">{formatStorePrice(item.price, item.currency || 'INR')} per unit</p>
                          <p className="text-xs font-semibold text-neutral-900 mt-0.5">Subtotal: {formatStorePrice(item.price * item.quantity, item.currency || 'INR')}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="text-neutral-400 hover:text-red-600 p-1 text-xs font-bold"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                        <span className="text-xs text-neutral-500 font-medium">Quantity:</span>
                        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-2.5 py-1">
                          <button
                            onClick={() => handleDecrement(item.productId)}
                            className="w-6 h-6 rounded-md bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center hover:bg-neutral-200"
                          >
                            −
                          </button>
                          <span className="text-xs font-semibold text-neutral-900 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleIncrement(item.productId)}
                            className="w-6 h-6 rounded-md bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center hover:bg-neutral-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table (Hidden below md) */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        <th className="p-4">Product</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Quantity</th>
                        <th className="p-4">Subtotal</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-sm">
                      {cartItems.map((item) => (
                        <tr className="hover:bg-neutral-50/50 transition-colors" key={item.productId}>
                          <td className="p-4">
                            <Link
                              to={item.productId.startsWith('demo-') ? '/products' : productPath(item.productId)}
                              className="flex items-center space-x-3 group"
                            >
                              <img
                                src={getPhotoUrl(item.photo)}
                                alt={item.name}
                                className="h-14 w-14 object-contain rounded-lg bg-white p-1 border border-neutral-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/skin-of-korea-logo.png';
                                }}
                              />
                              <span className="font-semibold text-sm text-[#111111] group-hover:underline">{item.name}</span>
                            </Link>
                          </td>
                          <td className="p-4 text-sm font-medium text-neutral-600">{formatStorePrice(item.price, item.currency || 'INR')}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 w-max">
                              <button
                                onClick={() => handleDecrement(item.productId)}
                                className="w-6 h-6 rounded-md bg-white text-neutral-800 font-bold text-xs flex items-center justify-center border border-neutral-200 hover:bg-neutral-100"
                              >
                                −
                              </button>
                              <span className="text-xs font-semibold text-neutral-900 w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleIncrement(item.productId)}
                                className="w-6 h-6 rounded-md bg-white text-neutral-800 font-bold text-xs flex items-center justify-center border border-neutral-200 hover:bg-neutral-100"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-semibold text-[#111111]">{formatStorePrice(item.price * item.quantity, item.currency || 'INR')}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRemove(item.productId)}
                              className="text-neutral-400 hover:text-red-600 text-xs font-medium hover:underline transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                  <Link
                    to="/products"
                    className="w-full sm:w-auto text-center border border-neutral-300 text-neutral-800 font-medium px-5 py-2.5 rounded-lg text-xs hover:bg-neutral-100 transition-colors"
                  >
                    ← Continue Shopping
                  </Link>
                  <button
                    onClick={handleClearCart}
                    className="w-full sm:w-auto text-center text-neutral-500 hover:text-red-600 font-medium text-xs py-2 px-4 underline"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Right Column - Cart Summary */}
              <div className="bg-neutral-50 p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
                <h2 className="font-sans font-semibold text-base text-[#111111] pb-3 border-b border-neutral-200">Order Summary</h2>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatStorePrice(subTotal, cartCurrency)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-neutral-800 font-semibold">
                      <span>Discount Coupon</span>
                      <span>-{formatStorePrice(discount, cartCurrency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping Charges</span>
                    <span className="text-neutral-700 font-medium">{shippingCharges === 0 ? 'Free' : formatStorePrice(shippingCharges, cartCurrency)}</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline font-bold text-base text-[#111111]">
                    <span>Total Amount</span>
                    <span className="text-xl sm:text-2xl font-extrabold">{formatStorePrice(total, cartCurrency)}</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Have a Coupon?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="flex-grow px-3 py-2 rounded-lg border border-neutral-200 text-xs uppercase font-mono focus:outline-none focus:border-black"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="bg-black text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>

                {/* Proceed Button */}
                {hasDemoItems && (
                  <p className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-neutral-600">
                    Sample products are for preview only and are not available to order yet. Remove them from your basket to continue to checkout.
                  </p>
                )}
                {hasLegacyCurrency && (
                  <p role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    This basket contains items from the previous INR store. Remove them or clear your basket before checking out in GBP.
                  </p>
                )}
                <button
                  onClick={() => {
                    dispatch(saveShippingInfo({ ...shippingInfo, couponCode: appliedCoupon || undefined }));
                    navigate('/shipping');
                  }}
                  disabled={hasDemoItems || hasLegacyCurrency}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-colors shadow-xs text-center block mt-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {hasDemoItems ? 'Remove Sample Items to Checkout' : hasLegacyCurrency ? 'Clear previous-store items to checkout' : 'Proceed to Checkout ➔'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
