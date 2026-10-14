import React, { useEffect, useMemo, useState } from 'react';
import { FaHeart, FaRegHeart, FaStar, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { findMiikoreanProduct, formatStorePrice, sanitizeStoreHtml } from '../data/miikoreanStorefront';
import { useMiikoreanStorefront } from '../hooks/useMiikoreanStorefront';
import { addToCart } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { usePageSEO } from '../hooks/usePageSEO';
import { optimizeProductImageUrl } from '../utils/cloudinaryOptimize';

function readWishlist(): string[] {
  const stored = localStorage.getItem('miikorean-wishlist');
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) return parsed;
    console.error('Saved wishlist data is invalid.');
  } catch (error) {
    console.error('Could not read saved wishlist data.', error);
  }
  return [];
}

const MiikoreanProductPage: React.FC = () => {
  const { productId = '' } = useParams<{ productId: string }>();
  const { storefront, isLoading, error } = useMiikoreanStorefront();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const product = storefront ? findMiikoreanProduct(storefront.products, productId) : undefined;
  const variants = useMemo(() => product?.variants ?? [], [product]);
  const availableVariants = variants.filter((variant) => variant.available);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(readWishlist());
  }, []);

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.variants.find((variant) => variant.available) || product.variants[0];
    setSelectedVariantId(firstAvailable?.id ?? null);
    setSelectedImage(product.images[0]?.src || firstAvailable?.featured_image || product.photo);
  }, [product]);

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const price = Number(selectedVariant?.price ?? product?.price ?? 0);
  const compareAtPrice = Number(selectedVariant?.compare_at_price || 0);
  const imageList = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([
      ...(product.images || []).map((image) => image.src),
      ...variants.map((variant) => variant.featured_image).filter((image): image is string => Boolean(image)),
    ]));
  }, [product, variants]);
  const relatedProducts = useMemo(() => {
    if (!storefront || !product) return [];
    return storefront.products
      .filter((item) => item.handle !== product.handle && (item.category === product.category || item.vendor === product.vendor))
      .slice(0, 4);
  }, [product, storefront]);
  const isWishlisted = product ? wishlist.includes(product.handle) : false;

  usePageSEO({
    title: product ? `${product.name} | Mii Korean Skincare` : 'Korean Skincare | Mii Korean',
    description: product?.description || 'Shop authentic Korean skincare at Mii Korean.',
    canonical: product ? `/product/${product.handle}` : `/product/${productId}`,
    ogImage: selectedImage || product?.photo,
  });

  const toggleWishlist = () => {
    if (!product) return;
    const next = isWishlisted
      ? wishlist.filter((handle) => handle !== product.handle)
      : [...wishlist, product.handle];
    try {
      localStorage.setItem('miikorean-wishlist', JSON.stringify(next));
      setWishlist(next);
      toast.success(isWishlisted ? 'Removed from your wishlist' : 'Added to your wishlist');
    } catch (storageError) {
      console.error('Could not save wishlist changes.', storageError);
      toast.error('Your wishlist could not be saved on this device.');
    }
  };

  const addProductToCart = () => {
    if (!product || !selectedVariant || !selectedVariant.available) return;
    const currentCurrency = cartItems[0]?.currency || 'INR';
    if (cartItems.length > 0 && currentCurrency !== 'GBP') {
      toast.error('Your basket contains items priced in a different currency. Clear it before adding Miikorean products.');
      navigate('/cart');
      return;
    }

    const option = selectedVariant.title === 'Default Title' ? '' : ` — ${selectedVariant.title}`;
    dispatch(addToCart({
      productId: `${product.handle}__${selectedVariant.id}`,
      name: `${product.name}${option}`,
      price,
      currency: 'GBP',
      quantity,
      stock: 9999,
      photo: selectedVariant.featured_image || selectedImage || product.photo,
    }));
    toast.success('Added to your bag');
  };

  if (isLoading) {
    return <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center text-sm text-neutral-500">Loading product details…</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-semibold">Product details unavailable</h1><p className="mt-3 text-neutral-600">{error}</p></div>;
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-semibold">We couldn't find that product</h1><Link className="mt-5 inline-block text-neutral-900 underline" to="/products">Browse all skincare</Link></div>;
  }

  return (
    <div className="miikorean-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500">
        <Link to="/" className="hover:text-neutral-900">Home</Link><span className="mx-2">/</span>
        <Link to="/products" className="hover:text-neutral-900">Shop</Link><span className="mx-2">/</span>
        <span className="text-neutral-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="grid gap-3 sm:grid-cols-[76px_1fr]">
          {imageList.length > 1 && (
            <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
              {imageList.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(image)} aria-label={`Show product image ${index + 1}`} aria-pressed={selectedImage === image} className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg border ${selectedImage === image ? 'border-neutral-950' : 'border-neutral-200'}`}>
                  <img src={optimizeProductImageUrl(image, 160)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
          <div className="order-1 aspect-square overflow-hidden rounded-2xl bg-neutral-100 sm:order-2">
            <img src={optimizeProductImageUrl(selectedImage || product.photo, 1000)} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" loading="eager" fetchPriority="high" decoding="async" />
          </div>
        </div>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">{product.vendor}</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-neutral-950 sm:text-3xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
            <span className="flex text-neutral-800" aria-label="5 out of 5 stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></span>
            <span>Authentic Korean skincare</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-neutral-950">{formatStorePrice(price)}</span>
            {compareAtPrice > price && <span className="text-sm text-neutral-500 line-through">{formatStorePrice(compareAtPrice)}</span>}
          </div>

          {availableVariants.length > 1 && (
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium">Choose an option</legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button key={variant.id} type="button" disabled={!variant.available} onClick={() => setSelectedVariantId(variant.id)} aria-pressed={selectedVariantId === variant.id} className={`rounded-full border px-4 py-2 text-sm transition ${selectedVariantId === variant.id ? 'border-neutral-950 bg-neutral-100 text-neutral-950' : 'border-neutral-300'} disabled:cursor-not-allowed disabled:opacity-40`}>
                    {variant.title === 'Default Title' ? 'Standard' : variant.title}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <p className="mt-5 text-sm leading-7 text-neutral-600">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-full border border-neutral-300">
              <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-12 w-11 text-lg disabled:opacity-40">−</button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="h-12 w-11 text-lg">+</button>
            </div>
            <button type="button" onClick={addProductToCart} disabled={!selectedVariant?.available} className="min-h-12 flex-1 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300">
              {selectedVariant?.available ? 'Add to bag' : 'Sold out'}
            </button>
            <button type="button" onClick={toggleWishlist} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-neutral-900">
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          <div className="mt-6 grid gap-3 border-y border-neutral-200 py-4 text-sm text-neutral-600 sm:grid-cols-2">
            <p className="flex items-center gap-2"><FaTruck className="text-neutral-900" /> Free next-day delivery over £35</p>
            <p className="flex items-center gap-2"><FaShieldAlt className="text-neutral-900" /> Authentic Korean beauty products</p>
          </div>

          {product.bodyHtml && (
            <details className="mt-6 border-b border-neutral-200 py-4" open>
              <summary className="cursor-pointer text-sm font-semibold">Product details & how to use</summary>
              <div className="miikorean-rich-text mt-4 text-sm leading-7 text-neutral-700" dangerouslySetInnerHTML={{ __html: sanitizeStoreHtml(product.bodyHtml) }} />
            </details>
          )}
          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Product tags">
              {product.tags.slice(0, 8).map((tag) => <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{tag}</span>)}
            </div>
          )}
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-neutral-950">You may also like</h2>
            <Link to={`/products?brand=${encodeURIComponent(product.vendor)}`} className="text-sm font-medium text-neutral-900 hover:underline">Shop {product.vendor}</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link key={item.handle} to={`/product/${item.handle}`} className="group">
                <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100"><img src={optimizeProductImageUrl(item.photo, 400)} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-contain mix-blend-multiply transition group-hover:scale-105" /></div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-neutral-600">{formatStorePrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MiikoreanProductPage;
