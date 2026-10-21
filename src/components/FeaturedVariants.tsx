import React, { useRef } from 'react';
import { Product } from '../types/api-types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

const FeaturedVariants: React.FC<Props> = ({ products }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const candidates = (products || []).filter(
    (p) =>
      p.isActive !== false &&
      !(p.category || '').toLowerCase().includes('candle') &&
      !(p.name || '').toLowerCase().includes('candle') &&
      !(p.category || '').toLowerCase().includes('urli') &&
      ((Array.isArray(p.variants) && p.variants.length > 1) || p.featured)
  );
  const display = candidates.slice(0, 8);

  if (display.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.2em] block mb-2">
            SELECTED FINDS
          </span>
          <h2 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-[#111111]">
            Featured Products
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-2 font-light leading-relaxed">
            Explore selected products and available options from the URVA collection.
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="hidden sm:flex gap-2">
              <button
                aria-label="Previous"
                onClick={() => {
                  const el = (containerRef.current as HTMLDivElement | null);
                  if (!el) return;
                  el.scrollBy({ left: -Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-800 hover:bg-neutral-100 hover:border-black transition-colors"
              >
                ‹
              </button>
              <button
                aria-label="Next"
                onClick={() => {
                  const el = (containerRef.current as HTMLDivElement | null);
                  if (!el) return;
                  el.scrollBy({ left: Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-800 hover:bg-neutral-100 hover:border-black transition-colors"
              >
                ›
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="overflow-x-hidden whitespace-no-wrap scroll-smooth -mx-4 px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-6">
              {display.map(product => (
                <div key={product._id} className="flex-shrink-0 w-[320px] sm:w-[380px] lg:w-[420px] h-[520px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVariants;
