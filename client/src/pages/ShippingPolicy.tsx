import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaTruckFast } from 'react-icons/fa6';

const ShippingPolicy: React.FC = () => {
  usePageSEO({
    title: 'Shipping & Delivery Policy | URVA',
    description: 'Detailed shipping guidelines, delivery timelines, free delivery eligibility, and tracking information for URVA orders across India.',
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
                <FaTruckFast className="text-[#E57A22]" /> ORDER FULFILLMENT & LOGISTICS
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              We bring the authentic rural aura from remote Indian villages and cooperatives directly to your doorstep. Here is everything you need to know about how your orders are packaged, shipped, and delivered.
            </p>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E57A22] block mb-1">
                DISPATCH TIME
              </span>
              <p className="text-sm font-extrabold text-neutral-900">24 – 48 Hours</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Dispatched quickly from origin</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E57A22] block mb-1">
                FREE DELIVERY
              </span>
              <p className="text-sm font-extrabold text-neutral-900">Orders Over ₹999</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Across all major Indian PIN codes</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E57A22] block mb-1">
                TRANSIT TIME
              </span>
              <p className="text-sm font-extrabold text-neutral-900">2 – 6 Business Days</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Express courier networks</p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>1. Shipping Coverage Across India</span>
              </h2>
              <p>
                URVA proudly ships across India to over 19,000+ postal pin codes via verified express logistics partners (including Delhivery, BlueDart, DTDC, ExpressBees, and India Post Speed Post). 
              </p>
              <p>
                We service Metro cities, Tier-1, Tier-2, Tier-3 townships, and select rural destinations. In rare circumstances where a remote rural pin code is outside standard courier network coverage, we utilize India Post Speed Post to guarantee delivery.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Order Processing & Dispatch Timelines
              </h2>
              <p>
                Because our offerings come directly from regional artisans and farmer cooperatives:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  <strong>Standard Packaged Goods & Crafts:</strong> Dispatched within <strong>24 to 48 business hours</strong> of order verification (excluding Sundays and national holidays).
                </li>
                <li>
                  <strong>Freshly Prepared Regional Sweets:</strong> Items like Mana Godavari Bellam Putharekulu and artisanal Palm Jaggery sweets are freshly rolled and packaged in limited fresh batches before dispatch to ensure maximum shelf freshness.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. Estimated Delivery Timelines
              </h2>
              <p>Once dispatched from our regional centers, typical transit durations are:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
                  <thead className="bg-[#FAF7F2] text-neutral-900 font-bold border-b border-neutral-200">
                    <tr>
                      <th className="p-3">Destination Region</th>
                      <th className="p-3">Estimated Transit Window</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-600">
                    <tr>
                      <td className="p-3 font-semibold text-neutral-800">
                        Tier 1 Metros (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata)
                      </td>
                      <td className="p-3 font-medium text-emerald-700">2 – 4 Business Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-neutral-800">
                        Tier 2 & Tier 3 Regional Cities & State Capitals
                      </td>
                      <td className="p-3">3 – 6 Business Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-neutral-800">
                        North-East, J&K, Remote Towns & Island Territories
                      </td>
                      <td className="p-3">6 – 9 Business Days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-500 italic">
                * Note: Timelines may experience minor delays during heavy festive seasons (Diwali, Sankranti), adverse weather events, or regional public transport bandhs.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Shipping Charges & Free Delivery Threshold
              </h2>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200/80 space-y-2">
                <p className="font-bold text-neutral-900 text-xs">
                  🚚 Free Express Delivery:
                </p>
                <p className="text-xs text-neutral-600">
                  All domestic orders with a basket value of <strong>₹999 or more</strong> qualify for <strong>FREE standard shipping</strong> across India.
                </p>
              </div>
              <p>
                For orders below ₹999, an economical shipping fee (typically ₹49 to ₹79 depending on order weight and destination) is calculated automatically and clearly shown at checkout before you complete payment. No hidden delivery surcharges are levied thereafter.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                5. Specialized Multi-Layer Protective Packaging
              </h2>
              <p>
                Every category is handled with dedicated protective protocols suited to its nature:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  <strong>Regional Foods & Sweets:</strong> Sealed in food-grade, moisture-barrier pouches and sturdy outer cartons to prevent crushing.
                </li>
                <li>
                  <strong>Wild Araku Honey & Jaggery:</strong> Sealed with anti-leak safety caps and cushioned with heavy-duty air-bubble buffers to prevent glass or bottle breakage.
                </li>
                <li>
                  <strong>Handlooms & Textiles:</strong> Wrapped in waterproof outer wraps to prevent dust or moisture damage during transit.
                </li>
                <li>
                  <strong>Live Nursery Plants:</strong> Shipped in breathable, reinforced corrugated plant boxes with root ball moisture retention to arrive vibrant and healthy.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                6. Real-Time Tracking & Shipment Alerts
              </h2>
              <p>
                As soon as your parcel is handed to the courier partner:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  You will receive an automated dispatch notification with your <strong>Tracking Number (AWB)</strong> and courier partner link via SMS, WhatsApp, and Email.
                </li>
                <li>
                  You can track your package directly at any time via our{' '}
                  <Link to="/track-shipment" className="text-[#E57A22] font-semibold hover:underline">
                    Track Shipment Page
                  </Link>{' '}
                  or from your personal <strong>My Orders</strong> section.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                7. Delivery Attempts & Tampered Package Guidelines
              </h2>
              <p>
                Our courier partners attempt delivery up to <strong>3 times</strong> before returning an undelivered parcel to our warehouse. Please ensure your contact number is active and correct.
              </p>
              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-xl text-amber-950 text-xs leading-relaxed space-y-1">
                <span className="font-bold block">⚠️ Important Customer Notice upon Receipt:</span>
                If the outer shipping carton arrives visibly crushed, torn open, or tampered with, please <strong>DO NOT ACCEPT</strong> the parcel. Take a quick photo of the damaged outer box and contact our customer care immediately at <a href="mailto:urvaaofficial@gmail.com" className="font-semibold underline">urvaaofficial@gmail.com</a> or WhatsApp <a href="https://wa.me/919494957576" className="font-semibold underline">+91 94949 57576</a>.
              </div>
            </section>
          </div>

          {/* Contact & Grievance Card */}
          <LegalContactCard />

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
            <Link to="/privacy" className="text-neutral-500 hover:text-black transition">
              ← Previous: Privacy Policy
            </Link>
            <Link to="/refund-policy" className="text-[#E57A22] hover:underline">
              Next: Refund & Returns Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
