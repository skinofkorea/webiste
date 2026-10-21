import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaFileContract } from 'react-icons/fa6';

const TermsAndConditions: React.FC = () => {
  usePageSEO({
    title: 'Terms & Conditions | Skin of Korea UK',
    description: 'Read the official terms and conditions for purchasing authentic Korean skincare and K-Beauty essentials on Skin of Korea UK (https://skinofkorea.co.uk).',
    canonical: '/terms',
    noIndex: false,
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <LegalNav currentPath="/terms" />

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-neutral-200/80 shadow-xs">
          {/* Header Banner */}
          <div className="border-b border-neutral-100 pb-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                <FaFileContract className="text-[#1f5133]" /> LEGAL & COMPLIANCE
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              These Terms and Conditions govern your access to and purchase of 100% authentic Korean skincare products through <strong>Skin of Korea</strong> (
              <a href="https://skinofkorea.co.uk" className="text-[#1f5133] font-semibold hover:underline">
                https://skinofkorea.co.uk
              </a>
              ), your premier UK destination for curated K-Beauty solutions.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>1. Acceptance of Terms & About Skin of Korea</span>
              </h2>
              <p>
                By visiting, browsing, registering on, or purchasing products through <strong>Skin of Korea</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, please refrain from using our services.
              </p>
              <p>
                Skin of Korea curates genuine, lab-certified K-Beauty essentials from leading South Korean skincare brands including COSRX, Beauty of Joseon, Anua, Skin1004, and Haruharu Wonder, dispatched directly from our UK fulfilment centre.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Eligibility & Account Responsibility
              </h2>
              <p>
                To place an order on Skin of Korea, you must be at least 18 years of age or accessing the site under the supervision of a parent or legal guardian who agrees to these terms. When registering or checking out as a guest:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>You agree to provide true, accurate, current, and complete personal and delivery information.</li>
                <li>You are solely responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to notify us immediately of any unauthorized use of your account or security breach.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. Product Authenticity & Manufacturer Guarantees
              </h2>
              <p>
                All products stocked by Skin of Korea are 100% authentic, brand-new, and sourced directly from licensed South Korean distributors or authorized global brand partners.
              </p>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200/80 space-y-2">
                <p className="font-semibold text-neutral-900 text-xs">
                  ✨ Patch Testing & Formulation Advisories:
                </p>
                <p className="text-xs text-neutral-600">
                  Individual skin responses may vary. We recommend performing a 24-hour patch test prior to introducing new active ingredients (e.g. AHAs, BHAs, Retinoids, Niacinamide) to your routine. Always review individual packaging for allergen alerts and expiration dates (printed as YYYY/MM/DD according to South Korean standards).
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Pricing, Currency & Promotional Offers
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  All prices listed on the website are in British Pounds Sterling (GBP £) and include applicable UK VAT unless stated otherwise.
                </li>
                <li>
                  Shipping fees are calculated transparently and displayed prior to payment completion. Orders of £35 or more qualify for free standard UK tracked delivery.
                </li>
                <li>
                  Promotional coupons (such as <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 font-mono">WELCOME10</code>) are valid for specified timeframes and cannot be combined with conflicting offers or redeemed for cash.
                </li>
                <li>
                  We reserve the right to correct pricing or catalogue errors that may inadvertently occur due to typographical or technical anomalies.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                5. Orders & Secure Payment Processing
              </h2>
              <p>
                Placement of an order constitutes an offer to purchase. An order is confirmed once payment has been successfully authorized and a digital confirmation receipt is issued via email.
              </p>
              <p>
                Payments on Skin of Korea are securely processed through encrypted, PCI-DSS Level 1 compliant payment gateways supporting Visa, MasterCard, American Express, Apple Pay, Google Pay, and Klarna. We never store complete credit or debit card credentials on our servers.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                6. Shipping, UK Fulfilment & Delivery
              </h2>
              <p>
                Orders placed before 2:00 PM GMT on business days are dispatched within 24 to 48 hours via Royal Mail or premium courier. Standard UK transit takes 2 to 4 business days. For detailed terms regarding express shipping and tracking, please consult our dedicated{' '}
                <Link to="/shipping-policy" className="text-[#1f5133] font-semibold hover:underline">
                  Shipping & Delivery Policy
                </Link>
                .
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                7. Cancellations, Returns & Refunds
              </h2>
              <p>
                Under UK Consumer Contracts Regulations, you have the right to cancel or return unopened skincare items in their original protective seals within <strong>14 days of delivery</strong>. In the unlikely event an item arrives damaged or incorrect, contact us immediately for an express replacement or full refund. Full parameters are detailed in our{' '}
                <Link to="/refund-policy" className="text-[#1f5133] font-semibold hover:underline">
                  Refund & Return Policy
                </Link>
                .
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                8. Intellectual Property Rights
              </h2>
              <p>
                All brand logos, product photography, editorial skincare routines, and software code on <strong>Skin of Korea</strong> are the property of Skin of Korea or its licensed Korean brand partners. Unauthorized reproduction, scraping, or commercial exploitation is strictly prohibited without prior written consent.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                9. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by UK law, Skin of Korea shall not be liable for any indirect or consequential damages resulting from improper storage, misuse of skincare contrary to product directions, or unforeseen courier delays outside our reasonable control.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                10. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction over any claims or disputes.
              </p>
            </section>
          </div>

          {/* Contact & Grievance Card */}
          <LegalContactCard />

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
            <Link to="/" className="text-neutral-500 hover:text-black transition">
              ← Return to Storefront
            </Link>
            <Link to="/privacy" className="text-[#1f5133] hover:underline">
              Next: Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
