import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaSlidersH } from 'react-icons/fa';
import { Link, useLocation, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getCollectionProducts, StoreCollection, normalizeStoreHandle } from '../data/storefront';
import { useStorefront } from '../hooks/useStorefront';
import { usePageSEO } from '../hooks/usePageSEO';

const PAGE_SIZE = 24;

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const { collectionHandle, categorySlug } = useParams<{ collectionHandle?: string; categorySlug?: string }>();
  const { storefront, isLoading, error } = useStorefront();
  const query = new URLSearchParams(location.search);
  const [search, setSearch] = useState(query.get('q') || '');
  const [category, setCategory] = useState(query.get('category') || categorySlug || '');
  const [brand, setBrand] = useState(query.get('brand') || '');
  const [collection, setCollection] = useState(query.get('collection') || collectionHandle || '');
  const [sort, setSort] = useState<'recommended' | 'price-asc' | 'price-desc' | 'newest'>('recommended');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('q') || '');
    setCategory(params.get('category') || categorySlug || '');
    setBrand(params.get('brand') || '');
    setCollection(params.get('collection') || collectionHandle || '');
    setPage(1);
  }, [location.search, collectionHandle, categorySlug]);

  const products = useMemo(() => storefront?.products ?? [], [storefront]);
  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category).filter(Boolean)).values()).sort(), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.vendor).filter(Boolean)).values()).sort(), [products]);
  const selectedCollection = storefront?.collections.find((item) => item.handle === collection);

  const isWishlistFilter = query.get('wishlist') === 'true';

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      if (isWishlistFilter) {
        const stored = localStorage.getItem('skinofkorea-wishlist');
        const wishlistIds: string[] = stored ? JSON.parse(stored) : [];
        if (!wishlistIds.includes(product.handle)) return false;
      }

      const matchesCategory = !category || 
        normalizeStoreHandle(product.category) === normalizeStoreHandle(category) ||
        (normalizeStoreHandle(category) === 'spf' && /sun|spf/i.test(product.category)) ||
        (normalizeStoreHandle(category) === 'eyecream' && /eye/i.test(product.category));

      const matchesBrand = !brand || 
        product.vendor.toLowerCase() === brand.toLowerCase() ||
        normalizeStoreHandle(product.vendor) === normalizeStoreHandle(brand);

      let matchesCollection = true;
      if (collection) {
        if (selectedCollection) {
          matchesCollection = getCollectionProducts([product], selectedCollection).length > 0;
        } else if (normalizeStoreHandle(collection) === 'bestsellers') {
          matchesCollection = Boolean(product.featured || (product.stock > 0 && product.price > 0));
        } else {
          const normColl = normalizeStoreHandle(collection);
          const normVendor = normalizeStoreHandle(product.vendor);
          const normCat = normalizeStoreHandle(product.category);
          matchesCollection = normVendor === normColl || 
            normCat === normColl || 
            (normColl === 'spf' && (/sun|spf/i.test(product.category) || /sun|spf/i.test(product.name))) ||
            (normColl === 'eyecream' && (/eye/i.test(product.category) || /eye/i.test(product.name))) ||
            product.tags.some((t) => normalizeStoreHandle(t) === normColl);
        }
      }

      const searchText = `${product.name} ${product.description} ${product.vendor} ${product.category} ${product.tags.join(' ')}`.toLowerCase();
      const matchesSearch = !search.trim() || searchText.includes(search.trim().toLowerCase());

      return matchesCategory && matchesBrand && matchesCollection && matchesSearch;
    });

    if (sort === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'newest') result = [...result].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return result;
  }, [brand, category, collection, isWishlistFilter, products, search, selectedCollection, sort]);

  useEffect(() => {
    setPage(1);
  }, [brand, category, collection, search, sort]);

  usePageSEO({
    title: selectedCollection ? `${selectedCollection.title} | Skin of Korea` : 'Shop Korean Skincare | Skin of Korea',
    description: 'Explore authentic Korean skincare, makeup, masks, SPF and more from Skin of Korea.',
    canonical: '/products',
  });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setCollection('');
  };

  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const title = isWishlistFilter
    ? 'My Wish List'
    : selectedCollection?.title ||
      (collection ? collection.replace(/-/g, ' ').toUpperCase() : '') ||
      (category ? (categories.find((item) => normalizeStoreHandle(item) === normalizeStoreHandle(category)) || category.toUpperCase()) : '') ||
      'Shop all Korean skincare';

  return (
    <div className="skinofkorea-page min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-neutral-500"><Link to="/" className="hover:text-neutral-900">Home</Link><span className="mx-2">/</span><span className="text-neutral-800">Shop</span></nav>
        <header className="mb-7 rounded-2xl bg-neutral-100 px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Skin of Korea</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">Discover authentic Korean skincare favourites, with products for every step of your routine.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="self-start rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2"><FaSlidersH className="text-neutral-900" /><h2 className="text-sm font-semibold">Filter products</h2></div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500" htmlFor="category-filter">Category</label>
            <select id="category-filter" value={category} onChange={(event) => setCategory(event.target.value)} className="mb-5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={normalizeStoreHandle(item)}>{item}</option>)}
            </select>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500" htmlFor="brand-filter">Brand</label>
            <select id="brand-filter" value={brand} onChange={(event) => setBrand(event.target.value)} className="mb-5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
              <option value="">All brands</option>
              {brands.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {(category || brand || collection || search) && <button type="button" onClick={clearFilters} className="text-sm font-medium text-neutral-900 hover:underline">Clear filters</button>}
            {storefront && <p className="mt-5 border-t border-neutral-100 pt-4 text-xs text-neutral-500">Browse {products.length} products across {brands.length} Korean beauty brands.</p>}
          </aside>

          <main className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full sm:max-w-md">
                <FaSearch aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <span className="sr-only">Search products</span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, ingredients or brands" className="w-full rounded-full border border-neutral-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-neutral-800" />
              </label>
              <div className="flex items-center justify-between gap-3">
                <p aria-live="polite" className="text-xs text-neutral-500">{isLoading ? 'Loading products…' : `${filteredProducts.length} products`}</p>
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="sr-only">Sort products</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
                    <option value="recommended">Recommended</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                </label>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-neutral-200" />)}</div>
            ) : error ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-800">{error}</div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-semibold text-neutral-950">No products found</h2>
                <p className="mt-2 text-sm text-neutral-500">Try a different search or clear your filters.</p>
                <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white">Show all products</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                  {visibleProducts.map((product) => <ProductCard key={product.handle} product={product} />)}
                </div>
                {pageCount > 1 && (
                  <nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-3">
                    <button type="button" disabled={page === 1} onClick={() => { setPage((value) => value - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                    <span className="text-sm text-neutral-600">Page {page} of {pageCount}</span>
                    <button type="button" disabled={page === pageCount} onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40">Next</button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>

        {storefront?.collections && (
          <section className="mt-14 border-t border-neutral-200 pt-8">
            <h2 className="mb-4 text-xl font-semibold text-neutral-950">Shop by collection</h2>
            <div className="flex flex-wrap gap-2">
              {storefront.collections
                .filter((item) => getCollectionProducts(products, item).length > 0)
                .map((item: StoreCollection) => <Link key={item.handle} to={`/products?collection=${encodeURIComponent(item.handle)}`} className={`rounded-full border px-3 py-2 text-xs transition ${collection === item.handle ? 'border-neutral-950 bg-neutral-100 text-neutral-950' : 'border-neutral-200 bg-white hover:border-neutral-500'}`}>{item.title}</Link>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
