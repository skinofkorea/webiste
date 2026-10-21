import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronRight, FaTimes } from 'react-icons/fa';
import { CATEGORIES_DATA, BRANDS_DATA } from '../../data/categoriesAndBrands';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // Screenshot 1 has categories open by default
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleNavigate = (url: string) => {
    onClose();
    navigate(url);
  };

  const toggleCategories = () => {
    setCategoriesOpen(prev => {
      const next = !prev;
      if (next) setBrandsOpen(false);
      return next;
    });
  };

  const toggleBrands = () => {
    setBrandsOpen(prev => {
      const next = !prev;
      if (next) setCategoriesOpen(false);
      return next;
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex font-sans">
      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside 
        aria-label="Navigation Menu"
        className="relative w-[340px] max-w-[85vw] h-full max-h-screen bg-white shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Top Header with MENU centered and close icon */}
        <div className="relative py-3 px-4 border-b border-neutral-200/90 flex items-center justify-between bg-white shrink-0">
          <div className="w-6" />
          <span className="text-[12px] font-bold text-[#363070] tracking-[0.18em] uppercase">
            MENU
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-neutral-100">
          
          {/* ─── TOP SECTION: Categories & Brands Accordions ─── */}
          <div className="pb-1 space-y-1">
            
            {/* 1. SHOP BY CATEGORIES */}
            <div>
              <button
                type="button"
                onClick={toggleCategories}
                className="w-full flex items-center gap-1.5 py-2.5 text-left group"
              >
                <span className="text-[13px] font-bold text-[#363070] tracking-wide uppercase transition-colors group-hover:text-[#4d449e]">
                  SHOP BY CATEGORIES
                </span>
                {categoriesOpen ? (
                  <FaChevronDown className="text-[10px] text-[#363070] transition-transform duration-200" />
                ) : (
                  <FaChevronRight className="text-[10px] text-[#363070] transition-transform duration-200" />
                )}
              </button>

              {/* 2-Column Categories Grid (Exact Screenshot 1) */}
              {categoriesOpen && (
                <div className="mt-1 mb-3 grid grid-cols-2 gap-3 animate-fadeIn">
                  {CATEGORIES_DATA.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleNavigate(`/collections/${cat.handle}`)}
                      className="group flex flex-col items-center justify-between bg-white rounded-2xl p-3 border border-neutral-200/90 hover:border-[#363070]/50 hover:shadow-sm transition-all text-center min-h-[160px]"
                    >
                      <div className="w-full aspect-square flex items-center justify-center p-1.5 overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.title}
                          loading="lazy"
                          onError={(e) => {
                            if (cat.fallbackImage && e.currentTarget.src !== cat.fallbackImage) {
                              e.currentTarget.src = cat.fallbackImage;
                            }
                          }}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-neutral-900 group-hover:text-[#363070]">
                        {cat.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. SHOP BY BRANDS */}
            <div>
              <button
                type="button"
                onClick={toggleBrands}
                className="w-full flex items-center gap-1.5 py-2.5 text-left group"
              >
                <span className="text-[13px] font-bold text-[#363070] tracking-wide uppercase transition-colors group-hover:text-[#4d449e]">
                  SHOP BY BRANDS
                </span>
                {brandsOpen ? (
                  <FaChevronDown className="text-[10px] text-[#363070] transition-transform duration-200" />
                ) : (
                  <FaChevronRight className="text-[10px] text-[#363070] transition-transform duration-200" />
                )}
              </button>

              {/* 4-Column Brands Grid (Exact Screenshot 2) */}
              {brandsOpen && (
                <div className="mt-1 mb-3 animate-fadeIn">
                  <div className="grid grid-cols-4 gap-2">
                    {BRANDS_DATA.map((brand) => (
                      <button
                        key={brand.handle}
                        type="button"
                        onClick={() => handleNavigate(`/collections/${brand.handle}`)}
                        title={brand.name}
                        className="group flex items-center justify-center aspect-square p-2 bg-white rounded-xl border border-neutral-200/90 hover:border-[#363070] hover:shadow-xs transition"
                      >
                        <img
                          src={brand.image}
                          alt={brand.name}
                          loading="lazy"
                          onError={(e) => {
                            if (brand.fallbackImage && e.currentTarget.src !== brand.fallbackImage) {
                              e.currentTarget.src = brand.fallbackImage;
                            }
                          }}
                          className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/pages/collections')}
                      className="text-[11px] font-bold text-[#363070] hover:underline"
                    >
                      View All Brands &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ─── MAIN NAV ITEMS (Exact typography from Screenshot) ─── */}
          <div className="divide-y divide-neutral-100/90 pt-1">
            <button
              type="button"
              onClick={() => handleNavigate('/collections/bestsellers')}
              className="w-full py-3.5 text-left text-[13px] font-bold tracking-wider text-neutral-900 uppercase hover:text-[#363070] transition-colors"
            >
              BESTSELLERS
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/collections/cleanser')}
              className="w-full py-3.5 text-left text-[13px] font-bold tracking-wider text-neutral-900 uppercase hover:text-[#363070] transition-colors"
            >
              CLEANSER
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/collections/toner')}
              className="w-full py-3.5 text-left text-[13px] font-bold tracking-wider text-neutral-900 uppercase hover:text-[#363070] transition-colors"
            >
              TONER
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/collections/moisturiser')}
              className="w-full py-3.5 text-left text-[13px] font-bold tracking-wider text-neutral-900 uppercase hover:text-[#363070] transition-colors"
            >
              MOISTURISER
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/collections/spf')}
              className="w-full py-3.5 text-left text-[13px] font-bold tracking-wider text-neutral-900 uppercase hover:text-[#363070] transition-colors"
            >
              SPF
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/collections/masks')}
              className="w-full py-3.5 text-left text-[13px] font-bold tracking-wider text-neutral-900 uppercase hover:text-[#363070] transition-colors"
            >
              MASKS
            </button>

            {/* MORE Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setMoreOpen(prev => !prev)}
                className="w-full flex items-center justify-between py-3.5 text-left group"
              >
                <span className="text-[13px] font-bold tracking-wider text-neutral-900 uppercase group-hover:text-[#363070] transition-colors">
                  MORE
                </span>
                {moreOpen ? (
                  <FaChevronDown className="text-xs text-neutral-400" />
                ) : (
                  <FaChevronRight className="text-xs text-neutral-400" />
                )}
              </button>

              {moreOpen && (
                <div className="pl-3 pb-3 space-y-2 text-xs font-semibold text-neutral-700 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pages/learn-about-k-beauty')}
                    className="block py-1 hover:text-[#363070] text-left w-full"
                  >
                    Learn About K-Beauty
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pages/about-us')}
                    className="block py-1 hover:text-[#363070] text-left w-full"
                  >
                    About Us
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pages/contact')}
                    className="block py-1 hover:text-[#363070] text-left w-full"
                  >
                    Contact Us
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── BOTTOM SECTION: My Wish List ─── */}
          <div className="pt-3 pb-6">
            <button
              type="button"
              onClick={() => handleNavigate('/products?wishlist=true')}
              className="w-full py-2.5 text-left text-[13px] font-normal text-neutral-600 hover:text-black transition-colors"
            >
              My Wish List
            </button>
          </div>

        </div>
      </aside>
    </div>,
    document.body
  );
};

export default MobileSidebarDrawer;
