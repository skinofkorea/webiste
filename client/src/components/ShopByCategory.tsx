import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { cn } from '../lib/utils';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryOptimize';

export interface CategoryItem {
  id: string;
  name: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  link: string;
  badge?: string;
  highlightColor?: string;
}

// Retain alias for backwards compatibility
export type CategoryFlipItem = CategoryItem;

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cleanser',
    name: 'Cleanser',
    subtitle: 'Foam & Oil Cleansers',
    image: '/images/home-categories/cleanser.webp',
    imageAlt: 'Cleansers for all skin types',
    link: '/collections/cleanser',
    badge: 'Step 1',
    highlightColor: '#4361EE',
  },
  {
    id: 'toner',
    name: 'Toner & Pads',
    subtitle: 'Hydrating & Calming',
    image: '/images/home-categories/toner.webp',
    imageAlt: 'Korean skin toners and essence pads',
    link: '/collections/toner',
    badge: 'Hydrate',
    highlightColor: '#3A0CA3',
  },
  {
    id: 'moisturiser',
    name: 'Moisturiser',
    subtitle: 'Creams & Emulsions',
    image: '/images/home-categories/moisturiser.webp',
    imageAlt: 'Korean barrier creams and moisturisers',
    link: '/collections/moisturiser',
    badge: 'Barrier',
    highlightColor: '#7209B7',
  },
  {
    id: 'spf',
    name: 'SPF Sunscreen',
    subtitle: 'Lightweight & No White Cast',
    image: '/images/home-categories/spf.webp',
    imageAlt: 'Viral Korean SPF 50+ sunscreens',
    link: '/collections/spf',
    badge: 'Protect',
    highlightColor: '#F72585',
  },
  {
    id: 'masks',
    name: 'Sheet Masks',
    subtitle: 'Collagen & Overnight',
    image: '/images/home-categories/masks.webp',
    imageAlt: 'Korean sheet masks and hydrogel masks',
    link: '/collections/masks',
    badge: 'Glow',
    highlightColor: '#4CC9F0',
  },
  {
    id: 'eyecream',
    name: 'Eye Care',
    subtitle: 'Retinal & Peptides',
    image: '/images/home-categories/eyecream.webp',
    imageAlt: 'Korean eye creams and wrinkle care',
    link: '/collections/eyecream',
    badge: 'Revitalize',
    highlightColor: '#805AD5',
  },
];

export interface ShopByCategoryProps {
  items?: CategoryItem[];
  className?: string;
  heading?: string;
  subheading?: string;
  eyebrow?: string;
}

export function ShopByCategory({
  items = DEFAULT_CATEGORIES,
  className,
  heading = 'Shop by Category',
  subheading,
  eyebrow = 'CURATED REGIONAL COLLECTIONS',
}: ShopByCategoryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesList = items && items.length > 0 ? items : DEFAULT_CATEGORIES;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      aria-label="Shop by Category"
      className={cn(
        'w-full bg-[#FAFAFA] border-t border-neutral-200 pt-6 pb-3 sm:pt-8 sm:pb-4',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 sm:mb-5 gap-3">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-1">
              {eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111111] tracking-tight font-sans">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 max-w-xl font-normal leading-relaxed">
                {subheading}
              </p>
            )}
          </div>

          {/* Desktop Navigation Arrows & View All Link */}
          <div className="flex items-center justify-center md:justify-end gap-3 shrink-0">
            <Link
              to="/products"
              className="text-xs sm:text-sm font-medium text-neutral-800 hover:text-black underline-offset-4 hover:underline transition-colors mr-2"
            >
              View All Products &rarr;
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll categories left"
                className="w-8 h-8 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:shadow"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll categories right"
                className="w-8 h-8 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:shadow"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Circular Categories Scroll / Grid Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex items-start gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-2 pt-1 px-1 snap-x snap-mandatory justify-start md:justify-center"
          >
            {categoriesList.map((category) => (
              <Link
                key={category.id}
                to={category.link}
                className="group flex flex-col items-center shrink-0 snap-center text-center transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-2xl p-1"
                style={{ width: 'clamp(96px, 14vw, 136px)' }}
              >
                {/* Round Avatar Circle Container */}
                <div className="relative mb-3">
                  {/* Outer Ring with Minimal Hover Accent */}
                  <div
                    className={cn(
                      'relative p-[3px] rounded-full transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:-translate-y-1',
                      category.id === 'shop-all'
                        ? 'bg-gradient-to-tr from-neutral-900 via-neutral-600 to-neutral-900'
                        : 'bg-gradient-to-tr from-neutral-200 via-neutral-100 to-neutral-200 group-hover:from-neutral-900 group-hover:via-neutral-700 group-hover:to-neutral-900'
                    )}
                  >
                    {/* Inner Circle Wrapper */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-100">
                        <img
                          src={optimizeCloudinaryUrl(category.image, 240)}
                          alt={category.imageAlt || category.name}
                          className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-out group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Pill Badge on the circle */}
                  {category.badge && (
                    <span
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs border border-white uppercase tracking-wider bg-black text-white"
                    >
                      {category.badge}
                    </span>
                  )}
                </div>

                {/* Category Name Label */}
                <h3 className="text-xs sm:text-sm font-semibold text-[#111111] group-hover:text-black transition-colors leading-snug line-clamp-2 max-w-[120px] font-sans">
                  {category.name}
                </h3>

                {/* Subtitle / Micro Hint */}
                {category.subtitle && (
                  <span className="text-[10px] sm:text-[11px] text-neutral-500 font-normal mt-0.5 line-clamp-1 max-w-[110px] group-hover:text-neutral-700">
                    {category.subtitle}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="mt-2 flex sm:hidden justify-center items-center gap-1.5 text-[11px] text-gray-400 font-light">
          <span>&larr; Swipe to explore categories &rarr;</span>
        </div>
      </div>
    </section>
  );
}

export default ShopByCategory;
