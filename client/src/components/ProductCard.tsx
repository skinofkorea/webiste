import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementCartItem, decrementCartItem } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { Product } from '../types/api-types';
import { optimizeProductImageUrl } from '../utils/cloudinaryOptimize';
import { formatStorePrice } from '../data/miikoreanStorefront';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
  tone?: 'default' | 'peach';
  homepage?: boolean;
}

interface ProductVariantPrice {
  price?: number | string | null;
  salePrice?: number | string | null;
  compare_at_price?: number | string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, tone = 'default', homepage = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  let displayPrice = product.price;
  let priceLabel = '';
  let compareAtPrice: number | undefined;

  if (hasVariants) {
    const prices = product.variants
      .map((variant: ProductVariantPrice) => ({
        price: Number(variant.salePrice ?? variant.price ?? 0),
        compareAtPrice: Number(variant.compare_at_price ?? 0),
      }))
      .filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices.map((variant) => variant.price));
      const maxPrice = Math.max(...prices.map((variant) => variant.price));
      displayPrice = minPrice;
      const cheapestVariant = prices.find((variant) => variant.price === minPrice);
      if (cheapestVariant && cheapestVariant.compareAtPrice > minPrice) {
        compareAtPrice = cheapestVariant.compareAtPrice;
      }
      priceLabel = minPrice !== maxPrice
        ? `${formatStorePrice(minPrice, product.currency)} – ${formatStorePrice(maxPrice, product.currency)}`
        : formatStorePrice(minPrice, product.currency);
    }
  }

  const formattedPrice = priceLabel || formatStorePrice(displayPrice, product.currency);
  const isOutOfStock = product.stock <= 0;
  const cartItem = cartItems.find((item) => item.productId === product._id);
  const isPeachTone = tone === 'peach';

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isOutOfStock) return;

    if (hasVariants) {
      navigate(`/product/${product._id}`);
      return;
    }

    const currentCurrency = cartItems[0]?.currency || 'INR';
    if (cartItems.length > 0 && currentCurrency !== (product.currency || 'INR')) {
      toast.error('Your basket contains items in a different currency. Clear it before adding this product.');
      navigate('/cart');
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: displayPrice,
        currency: product.currency || 'INR',
        quantity: 1,
        stock: product.stock,
        photo: product.photo,
      })
    );
  };

  const handleIncrement = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(incrementCartItem(product._id));
  };

  const handleDecrement = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(decrementCartItem(product._id));
  };

  const handleGoToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate('/cart');
  };

  const getPhotoUrl = (photoUrl?: string) => {
    if (!photoUrl) return 'https://www.miikorean.com/cdn/shop/files/Mii_Korean_Logo_46f0bcea-5297-4762-ade7-0f3998356de9_175x.png?v=1774335418';
    return optimizeProductImageUrl(photoUrl, 400);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className={`miikorean-product-card rounded-2xl p-3 sm:p-4 transition-all duration-300 flex flex-col justify-between h-full group relative cursor-pointer font-sans ${
        isPeachTone
          ? 'border border-[#ead3bd] bg-gradient-to-b from-[#fffaf4] to-[#f8e9db] shadow-[0_8px_24px_rgba(116,71,39,0.07)] hover:-translate-y-1 hover:border-[#c98b58] hover:shadow-[0_14px_32px_rgba(116,71,39,0.15)]'
          : 'border border-neutral-200 bg-white hover:border-neutral-500 hover:shadow-md'
      }`}
    >
      {/* Top Image Container */}
      <div className={`relative rounded-xl flex items-center justify-center aspect-square mb-3 overflow-hidden transition-colors border ${
        isPeachTone
          ? 'border-[#f0dfcf] bg-gradient-to-br from-[#f4e3d2] via-[#fff8f0] to-[#ecd8c6]'
          : 'border-neutral-100 bg-neutral-100'
      }`}>
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl">
            <span className="bg-neutral-100 text-neutral-800 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full border border-neutral-200">
              Out of Stock
            </span>
          </div>
        )}

        <img
          src={getPhotoUrl(product.photo)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Information Section (Matches Reference Screenshot) */}
      <div className="flex flex-col flex-1">
        {/* Title + Price Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-950 leading-snug line-clamp-2 group-hover:text-neutral-600 transition-colors flex-1">
            {product.name}
          </h3>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-xs font-semibold text-neutral-950 whitespace-nowrap sm:text-sm">{formattedPrice}</span>
            {compareAtPrice && (
              <span className="text-[10px] font-normal text-neutral-500 line-through sm:text-xs">
                {formatStorePrice(compareAtPrice, product.currency)}
              </span>
            )}
          </div>
        </div>

        {!homepage && (
          <p className="mb-4 line-clamp-2 text-xs font-normal leading-relaxed text-neutral-500">
            {product.description || 'Explore the details of this Korean skincare product.'}
          </p>
        )}

        {/* Action Button & More Details */}
        <div className="mt-auto pt-2">
          {!hasVariants && cartItem ? (
            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-neutral-800 font-bold flex items-center justify-center hover:bg-neutral-100 transition-colors text-xs"
                >
                  −
                </button>
                <span className="text-xs font-semibold text-[#111111]">
                  {cartItem.quantity} in Cart
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-neutral-800 font-bold flex items-center justify-center hover:bg-neutral-100 transition-colors text-xs"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleGoToCart}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs py-2.5 rounded-lg uppercase tracking-wider transition-colors"
              >
                Go to Cart
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full font-medium text-xs py-3 rounded-lg transition-all flex items-center justify-center tracking-widest uppercase ${
                isOutOfStock
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : isPeachTone
                    ? 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-sm shadow-black/20'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-xs'
              }`}
            >
              <span>
                {isOutOfStock
                  ? 'Out of Stock'
                  : hasVariants && !homepage
                    ? 'Select Options'
                    : homepage
                      ? 'Add to Bag'
                      : 'Add to Cart'}
              </span>
            </button>
          )}

          {!homepage && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-800 transition-colors group-hover:text-black group-hover:underline underline-offset-4">
                More details &rarr;
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
