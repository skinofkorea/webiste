import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCollectionProducts, normalizeStoreHandle, sanitizeStoreHtml } from '../data/storefront';
import { BRANDS_DATA } from '../data/categoriesAndBrands';
import { useStorefront } from '../hooks/useStorefront';
import { usePageSEO } from '../hooks/usePageSEO';

const ContentPage: React.FC = () => {
  const { pageHandle = '' } = useParams<{ pageHandle: string }>();
  const { storefront, isLoading, error } = useStorefront();
  const page = storefront?.pages.find((item) => item.handle === pageHandle);
  const collections = storefront?.collections || [];
  const isCollectionPage = pageHandle === 'collections' || pageHandle === 'brands';

  const allBrands = useMemo(() => {
    if (!storefront?.products) return [];
    const brandMap = new Map<string, { name: string; vendor: string; handle: string; image: string; count: number }>();
    storefront.products.forEach((p) => {
      if (p.vendor) {
        const key = p.vendor.toLowerCase();
        const matched = BRANDS_DATA.find((b) => b.vendor.toLowerCase() === key || b.handle === normalizeStoreHandle(p.vendor));
        const productBrandLogo = (p as any).vendorLogo || null;
        const existing = brandMap.get(key);
        if (!existing) {
          brandMap.set(key, {
            name: p.vendor.toUpperCase(),
            vendor: p.vendor,
            handle: normalizeStoreHandle(p.vendor),
            image: productBrandLogo || matched?.image || '',
            count: 1,
          });
        } else {
          existing.count += 1;
          if (!existing.image && productBrandLogo) {
            existing.image = productBrandLogo;
          }
        }
      }
    });
    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [storefront?.products]);

  const pageTitle = page?.title || (isCollectionPage ? 'Brands & Collections' : 'Skin of Korea');

  usePageSEO({
    title: `${pageTitle} | Skin of Korea`,
    description: page?.body_html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Discover authentic Korean skincare brands and collections.',
    canonical: `/pages/${pageHandle}`,
  });

  if (isLoading) return <div className="mx-auto flex min-h-[40vh] max-w-4xl items-center justify-center text-sm text-neutral-500">Loading Skin of Korea…</div>;
  if (error) return <div role="alert" className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-red-800">{error}</div>;
  if (!page && !isCollectionPage) return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-semibold text-neutral-950">Page not found</h1><Link to="/" className="mt-5 inline-block text-neutral-900 underline">Return to Skin of Korea</Link></div>;

  const matchingProduct = storefront?.products.find((product) => normalizeStoreHandle(product.name) === pageHandle);

  return (
    <article className="skinofkorea-page min-h-[55vh] bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">{pageTitle}</span>
        </nav>
        <h1 className="mb-6 text-3xl font-semibold text-neutral-950 sm:text-4xl">{pageTitle}</h1>

        {isCollectionPage ? (
          <div className="space-y-12">
            {/* Brands Directory */}
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-950 sm:text-2xl font-sans">
                    Shop by Brand <span className="text-sm font-normal text-neutral-500">({allBrands.length} Brands)</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600">
                    Discover authentic Korean skincare by your favourite Seoul skincare houses.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="mt-2 sm:mt-0 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                >
                  Browse all products &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
                {allBrands.map((brand) => (
                  <Link
                    key={brand.handle}
                    to={`/collections/${brand.handle}`}
                    className="group flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-200/90 bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200 text-center"
                  >
                    <div className="w-full h-14 flex items-center justify-center mb-2">
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <span className="font-serif text-[11px] font-bold tracking-wider text-neutral-900 uppercase">
                          {brand.vendor}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {brand.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">
                      {brand.count} {brand.count === 1 ? 'product' : 'products'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories Directory */}
            {collections.length > 0 && (
              <div>
                <div className="mb-6 border-b border-neutral-200 pb-4">
                  <h2 className="text-xl font-bold text-neutral-950 sm:text-2xl font-sans">
                    Shop by Routine & Category
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600">
                    Find the exact step for your morning and evening skincare ritual.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collections.map((collection) => (
                    <Link
                      key={collection.handle}
                      to={`/collections/${collection.handle}`}
                      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="aspect-[16/9] bg-neutral-100 overflow-hidden">
                        {collection.image ? (
                          <img
                            src={collection.image}
                            alt={collection.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-white" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-neutral-950 group-hover:text-amber-800 transition-colors">
                          {collection.title}
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          {getCollectionProducts(storefront?.products || [], collection).length} products
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          page?.body_html && <div className="skinofkorea-rich-text text-sm leading-7 text-neutral-700" dangerouslySetInnerHTML={{ __html: sanitizeStoreHtml(page.body_html) }} />
        )}

        {matchingProduct && !page?.body_html && (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600">Explore the product details and available options.</p>
            <Link to={`/product/${matchingProduct.handle}`} className="mt-4 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white">View product</Link>
          </div>
        )}

        {!isCollectionPage && !page?.body_html && !matchingProduct && (
          <div className="rounded-2xl bg-neutral-100 p-6 text-sm leading-6 text-neutral-700">
            <p>Explore our Korean skincare range and find the routine that works for you.</p>
            <Link to="/products" className="mt-4 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white">Shop all products</Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default ContentPage;
