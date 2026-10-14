import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCollectionProducts, normalizeStoreHandle, sanitizeStoreHtml } from '../data/miikoreanStorefront';
import { useMiikoreanStorefront } from '../hooks/useMiikoreanStorefront';
import { usePageSEO } from '../hooks/usePageSEO';

const ANALYSIS_URL = 'https://app.renude.co/miikorean';

const MiikoreanContentPage: React.FC = () => {
  const { pageHandle = '' } = useParams<{ pageHandle: string }>();
  const { storefront, isLoading, error } = useMiikoreanStorefront();
  const page = storefront?.pages.find((item) => item.handle === pageHandle);
  const collections = storefront?.collections || [];

  usePageSEO({
    title: page ? `${page.title} | Mii Korean Skincare` : 'Mii Korean Skincare',
    description: page?.body_html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Discover Mii Korean Skincare.',
    canonical: `/pages/${pageHandle}`,
  });

  if (isLoading) return <div className="mx-auto flex min-h-[40vh] max-w-4xl items-center justify-center text-sm text-neutral-500">Loading Mii Korean…</div>;
  if (error) return <div role="alert" className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-red-800">{error}</div>;
  if (!page) return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-semibold text-neutral-950">Page not found</h1><Link to="/" className="mt-5 inline-block text-neutral-900 underline">Return to Mii Korean</Link></div>;

  const isAnalysisPage = pageHandle === 'ai-skin-analysis' || pageHandle === 'renude-analysis';
  const isCollectionPage = pageHandle === 'collections';
  const matchingProduct = storefront?.products.find((product) => normalizeStoreHandle(product.name) === pageHandle);

  return (
    <article className="miikorean-page min-h-[55vh] bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500"><Link to="/" className="hover:text-neutral-900">Home</Link><span className="mx-2">/</span><span className="text-neutral-800">{page.title}</span></nav>
        {isAnalysisPage ? (
          <header className="mb-7 rounded-2xl bg-neutral-100 px-6 py-8 text-center sm:px-10 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-600">Powered by Renude</p>
            <h1 className="mt-2 text-3xl font-semibold text-neutral-950 sm:text-4xl">Your skin, understood</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-700">Take the skin quiz, upload three photos and get a Korean skincare routine tailored to your goals.</p>
          </header>
        ) : (
          <h1 className="mb-6 text-3xl font-semibold text-neutral-950 sm:text-4xl">{page.title}</h1>
        )}

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
          page.body_html && <div className="miikorean-rich-text text-sm leading-7 text-neutral-700" dangerouslySetInnerHTML={{ __html: sanitizeStoreHtml(page.body_html) }} />
        )}

        {isAnalysisPage && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <iframe
              title="Renude AI skin analysis for Mii Korean"
              src={ANALYSIS_URL}
              allow="camera"
              referrerPolicy="strict-origin-when-cross-origin"
              className="block h-[900px] w-full border-0"
            />
          </div>
        )}

        {matchingProduct && !page.body_html && (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600">Explore the product details and available options.</p>
            <Link to={`/product/${matchingProduct.handle}`} className="mt-4 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white">View product</Link>
          </div>
        )}

        {!isAnalysisPage && !isCollectionPage && !page.body_html && !matchingProduct && (
          <div className="rounded-2xl bg-neutral-100 p-6 text-sm leading-6 text-neutral-700">
            <p>Explore our Korean skincare range and find the routine that works for you.</p>
            <Link to="/products" className="mt-4 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white">Shop all products</Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default MiikoreanContentPage;
