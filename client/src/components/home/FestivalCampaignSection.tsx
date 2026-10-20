import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaCopy, FaGift } from 'react-icons/fa';
import { useGetBannersQuery } from '../../redux/api/banner.api';

export const FestivalCampaignSection: React.FC = () => {
  const { data: bannerData } = useGetBannersQuery('festival_banner');
  const [copied, setCopied] = useState(false);

  const activeBanner = bannerData?.banners?.find((b) => b.isActive !== false);

  if (!activeBanner) {
    return null; // Gracefully hidden when no seasonal campaign is running
  }

  // Extract coupon code if found in tagline/subtitle
  const promoCodeMatch =
    activeBanner.tagline?.match(/CODE:\s*([A-Z0-9]+)/i) ||
    activeBanner.subtitle?.match(/CODE:\s*([A-Z0-9]+)/i) ||
    (activeBanner.badge?.includes('CODE') ? activeBanner.badge.match(/([A-Z0-9]{4,10})/) : null);

  const promoCode = promoCodeMatch ? promoCodeMatch[1] : 'GLOW15';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="w-full py-6 md:py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-[#111111] text-white shadow-2xl border border-neutral-800">
        {/* Background Image with Ambient Glow */}
        {activeBanner.imageUrl && (
          <div className="absolute inset-0 z-0">
            <picture>
              {activeBanner.mobileImageUrl && (
                <source media="(max-width: 640px)" srcSet={activeBanner.mobileImageUrl} />
              )}
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title || 'Seasonal Campaign'}
                className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
          </div>
        )}

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            {/* Seasonal Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider uppercase">
                <FaGift className="text-xs" />
                {activeBanner.badge || 'K-BEAUTY SEASONAL SPECIAL'}
              </span>
              {activeBanner.tagline && (
                <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
                  • {activeBanner.tagline}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {activeBanner.title}
            </h3>

            {/* Description */}
            {activeBanner.subtitle && (
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                {activeBanner.subtitle}
              </p>
            )}
          </div>

          {/* Action Callout Box */}
          <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Promo Code Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 px-4 flex items-center justify-between gap-4">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                  Promo Code
                </span>
                <span className="text-sm font-mono font-bold text-white tracking-widest">
                  {promoCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                aria-label="Copy Promo Code"
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? (
                  <>
                    <FaCheck className="text-emerald-400 text-[10px]" />
                    <span className="text-emerald-300 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="text-[10px]" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* CTA Button */}
            {activeBanner.linkUrl && (
              <Link
                to={activeBanner.linkUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-[#111111] text-xs sm:text-sm font-bold tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
              >
                <span>{activeBanner.buttonText || 'Shop Collection'}</span>
                <span>&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FestivalCampaignSection;
