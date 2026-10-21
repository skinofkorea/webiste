import React from 'react';

const marketplaceSteps = [
  ['Discover the origin', 'Find products connected to regional specialties and production hubs.'],
  ['Meet the makers', 'Learn about the people and communities behind the products.'],
  ['Explore the details', 'Review product information, pricing, and available sourcing details.'],
  ['Bring it home', 'Order online and follow your purchase through the customer account.'],
];

const ProductInfographic: React.FC = () => (
  <section className="my-12 w-full overflow-hidden rounded-3xl border border-[#D9DDCE] bg-[#FBF6ED] shadow-lg">
    <div className="bg-[#234331] px-5 py-7 text-center text-white sm:px-8">
      <h2 className="font-serif text-2xl font-bold sm:text-3xl">The Skin of Korea way</h2>
      <p className="mt-2 text-sm text-[#E9C77A]">One UGC– One Product</p>
    </div>
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
      {marketplaceSteps.map(([title, description], index) => (
        <article key={title} className="rounded-2xl border border-[#D9DDCE] bg-white p-5">
          <span className="text-xs font-bold tracking-widest text-[#8B5D2E]">0{index + 1}</span>
          <h3 className="mt-2 font-serif text-lg font-bold text-[#234331]">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
        </article>
      ))}
    </div>
  </section>
);

export default ProductInfographic;
