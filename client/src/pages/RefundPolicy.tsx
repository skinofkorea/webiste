import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaArrowRotateLeft, FaCircleCheck } from 'react-icons/fa6';

const RefundPolicy: React.FC = () => {
  usePageSEO({
    title: 'Refund & Returns Policy | Skin of Korea UK',
    description: 'Explore Skin of Korea 14-day hassle-free replacement, return, and refund policy for authentic Korean skincare products in the UK.',
    canonical: '/refund-policy',
    noIndex: false,
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <LegalNav currentPath="/refund-policy" />

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-neutral-200/80 shadow-xs">
          {/* Header Banner */}
          <div className="border-b border-neutral-100 pb-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                <FaArrowRotateLeft className="text-[#1f5133]" /> RETURNS & REFUND COMMITMENT
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Refund & Return Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              At <strong>Skin of Korea</strong>, your skincare journey and absolute satisfaction are our highest priorities. We ensure that every product you receive is fresh, 100% authentic, and arrives in pristine condition.
            </p>
          </div>

          {/* Guarantee Highlights Banner */}
          <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FaCircleCheck className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">
                  14-Day UK Return & Replacement Guarantee
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  If any item arrives damaged, leaking, defective, or incorrect, notify us within <strong>14 days of delivery</strong> for an immediate replacement or 100% full refund.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                1. Eligibility for Returns
              </h2>
              <p>
                To maintain the highest hygiene standards for cosmetics and skincare:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Items must be unopened, unused, in original packaging with intact protective seals or cellophane wrapping.</li>
                <li>Products must have been purchased directly from <a href="https://skinofkorea.co.uk" className="text-[#1f5133] underline">skinofkorea.co.uk</a>.</li>
                <li>Return requests must be initiated within 14 calendar days of confirmed carrier delivery.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Damaged, Leaking, or Incorrect Deliveries
              </h2>
              <p>
                If your parcel arrives visibly damaged during transit or contains an incorrect item:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-neutral-600">
                <li>Take a clear photo of the shipping box, shipping label, and damaged item(s).</li>
                <li>Email our dedicated support team at <a href="mailto:support@skinofkorea.co.uk" className="text-[#1f5133] font-semibold underline">support@skinofkorea.co.uk</a> with your Order ID.</li>
                <li>Our concierge will respond within 24 hours to issue a complimentary prepaid return label and dispatch an express replacement or process a full refund.</li>
              </ol>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. Refund Processing Timelines
              </h2>
              <p>
                Once your returned parcel is received and inspected at our UK fulfilment depot:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Refunds are approved and initiated within 1 to 2 business days.</li>
                <li>Funds will be automatically credited to your original payment method (Debit/Credit Card, Apple Pay, Google Pay, Klarna).</li>
                <li>Depending on your banking provider, refunds typically appear in your account within 3 to 5 business days.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Non-Returnable Items
              </h2>
              <p>
                Due to strict UK cosmetic safety and hygiene regulations, items that have been opened, sampled, unsealed, or purchased as clearance final-sale items cannot be returned unless proven defective or damaged upon arrival.
              </p>
            </section>
          </div>

          {/* Contact Card */}
          <LegalContactCard />

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
            <Link to="/shipping-policy" className="text-neutral-500 hover:text-black transition">
              ← Shipping & Delivery Policy
            </Link>
            <Link to="/terms" className="text-[#1f5133] hover:underline">
              Next: Terms & Conditions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
