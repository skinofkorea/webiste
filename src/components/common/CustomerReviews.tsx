import React from 'react';

const CustomerReviews: React.FC = () => {
  return (
    <section className="border-y border-[#D9DDCE] bg-white py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8B5D2E]">How URVA works</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-[#234331]">A more meaningful way to discover</h2>
        <div className="mt-8 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Discover the origin', 'Explore regions known for distinctive products and traditions.'],
            ['Meet the makers', 'Learn about the farmers, artisans, and producer groups behind goods.'],
            ['Shop with context', 'Review clear product details, pricing, and available sourcing information.'],
            ['Bring it home', 'Use convenient online ordering to discover regional specialties.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-[#D9DDCE] bg-[#FBF6ED] p-5">
              <h3 className="font-serif font-bold text-[#234331]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
