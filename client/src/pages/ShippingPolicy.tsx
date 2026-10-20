import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaTruckFast } from 'react-icons/fa6';

const ShippingPolicy: React.FC = () => {
  usePageSEO({
    title: 'Shipping & Delivery Policy | Skin of Korea UK',
    description: 'Detailed shipping guidelines, delivery timelines, free delivery eligibility, and tracking information for Skin of Korea orders across the UK.',
    canonical: '/shipping-policy',
    noIndex: false,
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <LegalNav currentPath="/shipping-policy" />

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-neutral-200/80 shadow-xs">
          {/* Header Banner */}
          <div className="border-b border-neutral-100 pb-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                <FaTruckFast className="text-[#1f5133]" /> ORDER FULFILLMENT & LOGISTICS
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              We deliver authentic Korean skincare directly from our UK fulfilment centre to your doorstep. Here is everything you need to know about how your orders are packaged, shipped, and tracked.
            </p>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f5133] block mb-1">
                DISPATCH TIME
              </span>
              <p className="text-sm font-extrabold text-neutral-900">24 – 48 Hours</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Orders before 2 PM dispatched same day</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f5133] block mb-1">
                FREE UK DELIVERY
              </span>
              <p className="text-sm font-extrabold text-neutral-900">Orders Over £35</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Across all England, Scotland, Wales & NI</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f5133] block mb-1">
                TRANSIT TIME
              </span>
              <p className="text-sm font-extrabold text-neutral-900">2 – 4 Business Days</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Fully tracked via Royal Mail</p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                1. Domestic UK Delivery Options & Rates
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-neutral-200 rounded-xl overflow-hidden">
                  <thead className="bg-[#FAF7F2] text-neutral-900 font-bold">
                    <tr>
                      <th className="p-3 border-b">Shipping Service</th>
                      <th className="p-3 border-b">Estimated Transit</th>
                      <th className="p-3 border-b">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600">
                    <tr>
                      <td className="p-3 font-medium text-neutral-900">Standard UK Tracked</td>
                      <td className="p-3">2 – 4 Business Days</td>
                      <td className="p-3">£3.99 (Free on orders £35+)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-neutral-900">Express Next-Day Tracked</td>
                      <td className="p-3">1 – 2 Business Days</td>
                      <td className="p-3">£5.99</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Order Status & Updates
              </h2>
              <p>
                As soon as your skincare order is packed and dispatched, you will receive an automatic dispatch notification with all relevant order updates. You can review your order status anytime in your{' '}
                <Link to="/my-orders" className="text-[#1f5133] font-semibold hover:underline">
                  My Orders
                </Link>{' '}
                account page.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. Temperature-Controlled Eco-Friendly Packaging
              </h2>
              <p>
                To preserve formulation integrity, sensitive serums, essences, and sunscreens are packed in eco-friendly, recyclable protective boxes that shield against temperature fluctuations and impact during transit.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Damaged or Tampered Parcels
              </h2>
              <p>
                If your shipping parcel arrives visibly damaged or tampered with, please take a clear photo before unboxing and notify our concierge immediately at{' '}
                <a href="mailto:support@skinofkorea.co.uk" className="text-[#1f5133] font-semibold underline">
                  support@skinofkorea.co.uk
                </a>
                . We will arrange an express replacement immediately.
              </p>
            </section>
          </div>

          {/* Contact Card */}
          <LegalContactCard />

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
            <Link to="/terms" className="text-neutral-500 hover:text-black transition">
              ← Terms & Conditions
            </Link>
            <Link to="/refund-policy" className="text-[#1f5133] hover:underline">
              Next: Refund & Return Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
