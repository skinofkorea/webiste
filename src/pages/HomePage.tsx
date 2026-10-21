import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaFire, FaGift, FaStar, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Testimonials from '../components/Testimonials';
import HomeFAQ from '../components/HomeFAQ';
import ProductCard from '../components/ProductCard';
import { StoreProduct, normalizeStoreHandle } from '../data/storefront';
import { BRANDS_DATA } from '../data/categoriesAndBrands';
import { useStorefront } from '../hooks/useStorefront';
import { usePageSEO } from '../hooks/usePageSEO';

const discoveryHeadlines = [
  'your favourites',
  'new arrivals',
  'routine essentials',
  'K-beauty finds',
];

const communityVideos = [
  { src: '/videos/ugc/a5d60306a9ea08946f62e282a35f5850_720w.mp4', shape: 'aspect-[4/5]' },
  { src: '/videos/ugc/f94f3e8fd94d4a475a44fffec26a0679_720w.mp4', shape: 'aspect-[4/3]' },
  { src: '/videos/ugc/5e79d3ec6038f9ef0ae92cdf2956cc47_720w.mp4', shape: 'aspect-[3/5]' },
  { src: '/videos/ugc/30aab721d6e04535e78145b516748a5b_720w.mp4', shape: 'aspect-[4/5]' },
  { src: '/videos/ugc/92e744fe8851d6c71be60b751d47acb3_720w.mp4', shape: 'aspect-[4/5]' },
  { src: '/videos/ugc/3e30faef379fc787a0bd044ae8ad5752_720w.mp4', shape: 'aspect-[3/5]' },
  { src: '/videos/ugc/5488715feb9f40309b296562d4fda70d_360w.mp4', shape: 'aspect-[4/3]' },
  { src: '/videos/ugc/65cc4eb5eb4c48b2e251a2ed5b907613_720w.mp4', shape: 'aspect-[3/5]' },
  { src: '/videos/ugc/9d9fe5d4e7db1741c7c83849c7f579df_720w.mp4', shape: 'aspect-[4/5]' },
  { src: '/videos/ugc/dddad4c3e497b2511a18376546f51bba_720w.mp4', shape: 'aspect-[3/5]' },
];

const communityVideoColumns = [
  communityVideos.filter((_, index) => index % 2 === 0),
  communityVideos.filter((_, index) => index % 2 === 1),
];

interface LazyCommunityVideoProps {
  src: string;
  label?: string;
  className: string;
}

const LazyCommunityVideo: React.FC<LazyCommunityVideoProps> = ({ src, label, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      aria-label={label}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
    />
  );
};


const HomePage: React.FC = () => {
  const { storefront, isLoading, error } = useStorefront();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [activeDiscoveryTab, setActiveDiscoveryTab] = useState('steals');
  const [activeDiscoveryHeadline, setActiveDiscoveryHeadline] = useState(0);
  const discoveryCarousel = useRef<HTMLDivElement>(null);
  const heroSlides = [
    { src: '/images/home-hero/04.webp', alt: 'Good skin, brighter days with TOCOBO sun gel' },
    { src: '/images/home-hero/03.webp', alt: 'Glow differently every day with Skin of Korea' },
    { src: '/images/home-hero/01.webp', alt: 'Healthy skin, happier you with Korean skincare' },
    { src: '/images/home-hero/02.webp', alt: 'Ready for every sunny moment with TOCOBO sun care' },
  ];
  const products = useMemo(() => storefront?.products ?? [], [storefront]);
  const categories = useMemo(() => {
    const availableProducts = products.filter((product) => product.photo);
    const categoryOptions = [
      { label: 'EYECREAM', matches: /^eye\s*cream$/i, image: '/images/home-categories/eyecream.webp' },
      { label: 'MASKS', matches: /^masks?$/i, image: '/images/home-categories/masks.webp' },
      { label: 'SPF', matches: /^spf$/i, image: '/images/home-categories/spf.webp' },
      { label: 'CLEANSER', matches: /^cleanser$/i, image: '/images/home-categories/cleanser.webp' },
      { label: 'MOISTURISER', matches: /^moisturiser$/i, image: '/images/home-categories/moisturiser.webp' },
      { label: 'TONER', matches: /^toner$/i, image: '/images/home-categories/toner.webp' },
    ];
    const categoryTiles = categoryOptions.flatMap(({ label, matches, image }) => {
      const matchingProducts = availableProducts.filter((product) => matches.test(product.category));
      const category = matchingProducts[0]?.category;
      if (!category) return [];
      return [{ name: label, category, image }];
    });
    return [
      { name: 'ALL PRODUCTS', category: '', image: '/images/home-categories/all-products.webp' },
      ...categoryTiles,
    ];
  }, [products]);
  const featuredProducts = useMemo(() => {
    const tagged = products.filter((product) => product.featured && product.stock > 0);
    return (tagged.length > 0 ? tagged : products.filter((product) => product.stock > 0)).slice(0, 8);
  }, [products]);
  const discoveryTabs = [
    { id: 'steals', label: 'Steals of the month', icon: FaTag },
    { id: 'gifting', label: 'Gifting', icon: FaGift },
    { id: 'trending', label: 'Trending products', icon: FaFire },
    { id: 'new', label: 'New arrivals', icon: FaStar },
  ];
  const tabCounts = useMemo(() => {
    const availableProducts = products.filter((product) => product.stock > 0);
    const steals = availableProducts.filter((product) =>
      product.variants?.some((variant) => {
        const price = Number(variant.price);
        const compareAtPrice = Number(variant.compare_at_price || 0);
        return variant.available && compareAtPrice > price && price > 0;
      })
    ).length;
    const gifting = availableProducts.filter((product) =>
      /gift|bundle|set|duo|routine|mask|cream|patch/i.test(
        `${product.name} ${(product.tags || []).join(' ')}`
      )
    ).length;
    const trending = availableProducts.filter(
      (product) =>
        product.featured ||
        (product.tags || []).some((tag) => /trend|popular|best.?seller|bestseller/i.test(tag))
    ).length;
    return {
      steals: steals > 0 ? steals : Math.min(availableProducts.length, 10),
      gifting: gifting > 0 ? gifting : Math.min(availableProducts.length, 10),
      trending: trending > 0 ? trending : Math.min(availableProducts.length, 12),
      new: availableProducts.length,
    };
  }, [products]);
  const getSalePrice = (product: StoreProduct) => {
    const variants = product.variants
      .filter((variant) => variant.available)
      .map((variant) => ({
        price: Number(variant.price),
        compareAtPrice: Number(variant.compare_at_price || 0),
      }))
      .filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
    const saleVariant = variants
      .filter((variant) => variant.compareAtPrice > variant.price)
      .sort((first, second) => first.price - second.price)[0];
    return saleVariant;
  };
  const discoveryProducts = useMemo(() => {
    const availableProducts = products.filter((product) => product.stock > 0);
    switch (activeDiscoveryTab) {
      case 'steals': {
        const steals = availableProducts.filter((product) =>
          product.variants?.some((variant) => {
            const price = Number(variant.price);
            const compareAtPrice = Number(variant.compare_at_price || 0);
            return variant.available && compareAtPrice > price && price > 0;
          })
        );
        return steals.length > 0 ? steals : availableProducts.slice(0, 10);
      }
      case 'gifting': {
        const gifts = availableProducts.filter((product) =>
          /gift|bundle|set|duo|routine|mask|cream|patch/i.test(
            `${product.name} ${(product.tags || []).join(' ')}`
          )
        );
        return gifts.length > 0 ? gifts : availableProducts.slice(0, 10);
      }
      case 'trending': {
        const trending = availableProducts.filter(
          (product) =>
            product.featured ||
            (product.tags || []).some((tag) => /trend|popular|best.?seller|bestseller/i.test(tag))
        );
        return trending.length > 0 ? trending : availableProducts.slice(0, 12);
      }
      case 'new':
        return [...availableProducts].sort(
          (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
        );
      default:
        return availableProducts.slice(0, 12);
    }
  }, [activeDiscoveryTab, products]);
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 3000);
    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveDiscoveryHeadline((currentHeadline) => (currentHeadline + 1) % discoveryHeadlines.length);
    }, 3000);
    return () => window.clearInterval(intervalId);
  }, []);


  const scrollDiscovery = (direction: 'left' | 'right') => {
    const carousel = discoveryCarousel.current;
    if (!carousel) return;
    const firstCard = carousel.querySelector<HTMLElement>('[data-discovery-card]');
    const distance = firstCard ? firstCard.offsetWidth + 20 : carousel.clientWidth * 0.8;
    carousel.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  usePageSEO({
    title: 'Skin of Korea | Discover Your Korean Skincare Routine',
    description: 'Shop authentic Korean skincare essentials, discover curated cult-favourite brands, and explore the best of Korean beauty.',
    canonical: '/',
  });

  return (
    <main className="skinofkorea-page skinofkorea-home bg-white">
      <section aria-label="Featured skincare campaigns" className="relative w-full overflow-hidden bg-neutral-100">
        <div className="relative aspect-[2.25/1] w-full">
          {heroSlides.map((slide, index) => (
            <Link
              key={slide.src}
              to="/products"
              tabIndex={index === activeHeroSlide ? 0 : -1}
              aria-hidden={index !== activeHeroSlide}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                index === activeHeroSlide ? 'z-[1] opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-contain"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            </Link>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-5">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show campaign ${index + 1}`}
              aria-current={index === activeHeroSlide}
              onClick={() => setActiveHeroSlide(index)}
              className={`h-2.5 rounded-full border border-white transition-all ${
                index === activeHeroSlide ? 'w-7 bg-neutral-950' : 'w-2.5 bg-white/80 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#fff8ee]">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-7 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-800 sm:text-xs">Find your routine</p>
              <h2 className="mt-1.5 text-[27px] font-medium leading-tight text-neutral-950 sm:text-4xl">Shop by <span className="italic text-amber-700">category</span></h2>
            </div>
            <Link to="/pages/collections" className="hidden items-center gap-1.5 pb-1 text-sm font-semibold text-neutral-900 transition hover:text-amber-800 sm:inline-flex">All collections <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : (
            <>
              <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-5">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.category ? `/products?category=${encodeURIComponent(normalizeStoreHandle(category.category))}` : '/products'}
                    className="group flex w-[calc((100%-36px)/4)] shrink-0 snap-start flex-col items-center text-center sm:w-[calc((100%-120px)/7)]"
                  >
                    <div className="h-[76px] w-[76px] min-h-[76px] min-w-[76px] shrink-0 rounded-full bg-gradient-to-br from-[#f3cfa1] via-[#f8e5cd] to-[#edc7b9] p-[4px] shadow-[0_5px_16px_rgba(131,80,42,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_22px_rgba(131,80,42,0.2)] sm:h-[104px] sm:w-[104px] sm:min-h-[104px] sm:min-w-[104px] sm:p-[5px]">
                      <div className="h-full w-full overflow-hidden rounded-full border border-white/90 bg-white">
                        <img src={category.image} alt="" loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    </div>
                    <p className="mt-3 min-h-4 text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-800 transition-colors group-hover:text-amber-800 sm:mt-3.5 sm:min-h-5 sm:text-xs">{category.name}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:hidden">
                <span>Swipe to explore</span>
                <FaArrowRight aria-hidden="true" />
              </div>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="discover-heading" className="overflow-hidden bg-[#fff8ee] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-amber-200 pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800 sm:text-xs">Thoughtful picks for your routine</p>
              <h2 id="discover-heading" className="text-3xl font-medium leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
                <span>Discover</span>{' '}
                <span key={discoveryHeadlines[activeDiscoveryHeadline]} aria-live="polite" aria-atomic="true" className="announcement-slide inline-block italic text-amber-700">
                  {discoveryHeadlines[activeDiscoveryHeadline]}
                </span>
              </h2>
            </div>
            <Link to="/products" className="hidden items-center gap-2 pb-1 text-sm font-semibold text-neutral-900 transition hover:text-amber-800 sm:inline-flex">
              Shop all skincare <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="tablist"
              aria-label="Discover products"
              className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:gap-3 sm:px-0"
            >
              {discoveryTabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeDiscoveryTab === id;
                const count = tabCounts[id as keyof typeof tabCounts];
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`discover-tab-${id}`}
                    aria-selected={isActive}
                    aria-controls="discover-products"
                    onClick={() => {
                      setActiveDiscoveryTab(id);
                      discoveryCarousel.current?.scrollTo({ left: 0, behavior: 'smooth' });
                    }}
                    className={`group flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-neutral-950 text-white shadow-md shadow-neutral-950/20 ring-1 ring-neutral-950'
                        : 'border border-amber-200/90 bg-white text-neutral-800 shadow-xs hover:border-neutral-950 hover:bg-amber-50/40 hover:text-neutral-950'
                    }`}
                  >
                    <Icon
                      className={`text-sm sm:text-base transition-colors ${
                        isActive ? 'text-amber-400' : 'text-amber-700 group-hover:text-amber-900'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                    {typeof count === 'number' && (
                      <span
                        className={`ml-0.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs transition-colors ${
                          isActive
                            ? 'bg-white/20 text-amber-200'
                            : 'bg-amber-100 text-amber-900 group-hover:bg-amber-200/70'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous products"
                onClick={() => scrollDiscovery('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-xs transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next products"
                onClick={() => scrollDiscovery('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-xs transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            id="discover-products"
            ref={discoveryCarousel}
            role="tabpanel"
            aria-labelledby={`discover-tab-${activeDiscoveryTab}`}
            className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 sm:gap-5"
          >
            {isLoading ? (
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-[72%] shrink-0 snap-start animate-pulse rounded-2xl bg-white p-3 sm:w-[calc((100%-60px)/4)]">
                  <div className="aspect-square rounded-xl bg-[#f4e8db]" />
                  <div className="mt-4 h-4 rounded bg-[#f4e8db]" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-[#f4e8db]" />
                </div>
              ))
            ) : error ? (
              <p role="alert" className="w-full py-10 text-center text-sm text-red-700">{error}</p>
            ) : discoveryProducts.length > 0 ? (
              discoveryProducts.map((product) => {
                const sale = getSalePrice(product);
                return (
                  <article
                    key={product.handle}
                    data-discovery-card
                    className="relative w-[72%] shrink-0 snap-start sm:w-[calc((100%-60px)/4)]"
                  >
                    {(sale || activeDiscoveryTab === 'new') && (
                      <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-1.5">
                        {sale && (
                          <span className="rounded-full bg-amber-700 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                            Special price
                          </span>
                        )}
                        {activeDiscoveryTab === 'new' && (
                          <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                            New
                          </span>
                        )}
                      </div>
                    )}
                    <ProductCard product={product} tone="peach" homepage />
                  </article>
                );
              })
            ) : (
              <p className="w-full py-10 text-center text-sm text-neutral-600">More picks are on the way. Explore all products in the meantime.</p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:hidden">
            <span>{discoveryProducts.length} products</span>
            <span className="inline-flex items-center gap-2 text-amber-800">Swipe to explore <FaArrowRight aria-hidden="true" /></span>
          </div>
        </div>
      </section>

      <section className="brand-showcase relative isolate overflow-hidden py-8 text-neutral-950 sm:py-10">
        <div aria-hidden="true" className="brand-showcase-glow brand-showcase-glow-one" />
        <div aria-hidden="true" className="brand-showcase-glow brand-showcase-glow-two" />
        <div className="relative z-10">
          <div className="mx-auto mb-5 max-w-7xl px-4 sm:mb-6 sm:px-6 lg:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-800 sm:text-xs">
              Authentic Korean Skincare
            </p>
            <h2 className="mt-1 text-2xl font-medium leading-tight text-neutral-950 sm:text-3xl">
              Shop by <span className="italic text-[#8b451f]">brand</span>
            </h2>
          </div>

          <div className="brand-marquee" aria-label="Brands moving right to left">
            <div className="brand-marquee-track brand-marquee-track-left">
              {[false, true].map((isDuplicate) => (
                <div key={String(isDuplicate)} className="brand-marquee-group" aria-hidden={isDuplicate || undefined}>
                  {[...BRANDS_DATA, ...BRANDS_DATA].map((brand, idx) => (
                    <Link
                      key={`${brand.handle}-${idx}-${isDuplicate ? 'dup' : 'orig'}`}
                      to={`/products?brand=${encodeURIComponent(brand.vendor)}`}
                      aria-label={`Shop ${brand.name}`}
                      tabIndex={isDuplicate ? -1 : undefined}
                      className="brand-logo-tile group flex h-[88px] w-44 shrink-0 flex-col items-center justify-center rounded-2xl px-3 transition-all duration-300 hover:-translate-y-1 sm:h-[108px] sm:w-56 sm:rounded-[22px] sm:px-4"
                    >
                      <div className="flex h-10 w-full items-center justify-center sm:h-12">
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain filter transition duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <span className="mt-1.5 line-clamp-1 text-center text-[11px] font-semibold tracking-wide text-neutral-800 transition-colors group-hover:text-[#8b451f] sm:text-xs">
                        {brand.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="featured-edit relative isolate overflow-hidden py-12 sm:py-16">
        <div aria-hidden="true" className="featured-edit-glow" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative mb-7 flex flex-col gap-5 border-b border-[#dfc6ae] pb-6 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b451f] sm:text-xs">
                <FaStar aria-hidden="true" className="text-[10px]" />
                Loved by our community
              </p>
              <h2 className="mt-2 text-3xl font-medium leading-tight text-neutral-950 sm:text-4xl">Skincare <span className="italic text-[#8b451f]">favourites</span></h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-neutral-600 sm:text-sm">The tried-and-loved picks making everyday routines feel a little more special.</p>
            </div>
            <Link to="/products" className="group inline-flex w-fit items-center gap-3 rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-neutral-800 sm:text-sm">
              Shop all skincare <FaArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl border border-[#ead3bd] bg-[#f5e7d9]" />)}</div> : (
            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {featuredProducts.map((product) => <ProductCard key={product.handle} product={product} tone="peach" homepage />)}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="community-videos-heading" className="bg-[#fff8ef] px-4 py-12 text-[#2b211c] sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-3 border-b border-[#2b211c]/15 pb-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8b451f] sm:text-[10px]">Skin of Korea community</p>
              <h2 id="community-videos-heading" className="mt-2 text-3xl font-medium text-[#2b211c] sm:text-4xl">Real routines, <span className="italic text-[#8b451f]">real glow.</span></h2>
            </div>
            <p className="max-w-sm text-xs leading-5 text-[#2b211c]/65 sm:text-sm">A little inspiration from the people who make Skin of Korea special.</p>
          </div>
          <div className="community-video-mobile md:hidden">
            {communityVideoColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="community-video-lane" aria-label={columnIndex === 0 ? 'Videos moving top to bottom' : 'Videos moving bottom to top'}>
                <div className={`community-video-track ${columnIndex === 0 ? 'community-video-track-down' : 'community-video-track-up'}`}>
                  {[false, true].map((isDuplicate) => (
                    <div key={String(isDuplicate)} className="community-video-group" aria-hidden={isDuplicate || undefined}>
                      {column.map(({ src }, videoIndex) => (
                        <figure key={src} className="overflow-hidden rounded-2xl border border-[#8b451f]/10 bg-white shadow-[0_12px_30px_rgba(80,48,28,0.12)]">
                          <LazyCommunityVideo
                            src={src}
                            label={isDuplicate ? undefined : `Skin of Korea community video ${columnIndex * 5 + videoIndex + 1}`}
                            className="pointer-events-none block aspect-[4/5] w-full object-cover"
                          />
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="community-video-desktop hidden md:columns-3 md:gap-4 md:block">
            {communityVideos.map(({ src, shape }, index) => (
              <figure key={src} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-[#8b451f]/10 bg-white shadow-[0_12px_30px_rgba(80,48,28,0.12)] sm:mb-4 sm:rounded-3xl">
                <LazyCommunityVideo
                  src={src}
                  label={`Skin of Korea community video ${index + 1}`}
                  className={`pointer-events-none block w-full ${shape} object-cover`}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <HomeFAQ />

    </main>
  );
};

export default HomePage;
