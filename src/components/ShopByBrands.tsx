import React from 'react';
import { Link } from 'react-router-dom';
import { BRANDS_DATA } from '../data/categoriesAndBrands';

interface ShopByBrandsProps {
  className?: string;
  title?: string;
}

export const ShopByBrands: React.FC<ShopByBrandsProps> = ({
  className = '',
  title = 'Shop By Brands',
}) => {
  return (
    <section className={`py-10 sm:py-14 bg-white border-t border-neutral-100 ${className}`}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-sans">
            {title}
          </h2>
          <Link
            to="/pages/collections"
            className="text-xs sm:text-sm font-semibold text-[#363070] hover:text-[#5249a5] transition-colors"
          >
            View All Brands &rarr;
          </Link>
        </div>

        <ul className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 list-none p-0 m-0">
          {BRANDS_DATA.map((brand) => (
            <li key={brand.handle} className="group">
              <Link
                to={`/collections/${brand.handle}`}
                title={brand.name}
                aria-label={`Shop ${brand.name}`}
                className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 aspect-square"
              >
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    loading="lazy"
                    onError={(e) => {
                      if (brand.fallbackImage && e.currentTarget.src !== brand.fallbackImage) {
                        e.currentTarget.src = brand.fallbackImage;
                      }
                    }}
                    className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ShopByBrands;
