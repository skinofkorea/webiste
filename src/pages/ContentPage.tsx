import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCollectionProducts, normalizeStoreHandle, sanitizeStoreHtml } from '../data/storefront';
import { useStorefront } from '../hooks/useStorefront';
import { usePageSEO } from '../hooks/usePageSEO';

const ContentPage: React.FC = () => {
  const { pageHandle = '' } = useParams<{ pageHandle: string }>();
  const { storefront, isLoading, error } = useStorefront();
  const page = storefront?.pages.find((item) => item.handle === pageHandle);
  const collections = storefront?.collections || [];

  usePageSEO({
    title: page ? `${page.title} | Skin of Korea` : 'Skin of Korea',
    description: page?.body_html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Discover Skin of Korea.',
    canonical: `/pages/${pageHandle}`,
  });

  if (isLoading) return <div className="mx-auto flex min-h-[40vh] max-w-4xl items-center justify-center text-sm text-neutral-500">Loading Skin of Korea…</div>;
  if (error) return <div role="alert" className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-red-800">{error}</div>;
  if (!page) return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-semibold text-neutral-950">Page not found</h1><Link to="/" className="mt-5 inline-block text-neutral-900 underline">Return to Skin of Korea</Link></div>;

  const isCollectionPage = pageHandle === 'collections';
  const matchingProduct = storefront?.products.find((product) => normalizeStoreHandle(product.name) === pageHandle);

  return (
    <article className="skinofkorea-page min-h-[55vh] bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500"><Link to="/" className="hover:text-neutral-900">Home</Link><span className="mx-2">/</span><span className="text-neutral-800">{page.title}</span></nav>
        <h1 className="mb-6 text-3xl font-semibold text-neutral-950 sm:text-4xl">{page.title}</h1>

        {isCollectionPage ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link key={collection.handle} to={`/products?collection=${encodeURIComponent(collection.handle)}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="aspect-[16/9] bg-neutral-100">
                  {collection.image ? <img src={collection.image} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" /> : <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-white" />}
                </div>
                <div className="p-4"><h2 className="font-semibold text-neutral-950">{collection.title}</h2><p className="mt-1 text-xs text-neutral-500">{getCollectionProducts(storefront.products, collection).length} products</p></div>
              </Link>
            ))}
          </div>
        ) : (
          page.body_html && <div className="skinofkorea-rich-text text-sm leading-7 text-neutral-700" dangerouslySetInnerHTML={{ __html: sanitizeStoreHtml(page.body_html) }} />
        )}

        {matchingProduct && !page.body_html && (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600">Explore the product details and available options.</p>
            <Link to={`/product/${matchingProduct.handle}`} className="mt-4 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white">View product</Link>
          </div>
        )}

        {!isCollectionPage && !page.body_html && !matchingProduct && (
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
