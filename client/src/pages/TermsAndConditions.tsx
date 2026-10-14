import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaFileContract } from 'react-icons/fa6';

const TermsAndConditions: React.FC = () => {
  usePageSEO({
    title: 'Terms & Conditions | URVA',
    description: 'Read the official terms and conditions for purchasing authentic rural and regional products on URVA (https://urvaa.in).',
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
                <FaFileContract className="text-[#E57A22]" /> LEGAL & COMPLIANCE
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              These Terms and Conditions govern your access to and use of <strong>URVA</strong> (
              <a href="https://urvaa.in" className="text-[#E57A22] font-semibold hover:underline">
                https://urvaa.in
              </a>
              ), an authentic regional commerce platform connecting rural Indian cooperatives and artisans directly with customers.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>1. Acceptance of Terms & About URVA</span>
              </h2>
              <p>
                By visiting, browsing, registering on, or purchasing products through <strong>URVA</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, please refrain from using our services.
              </p>
              <p>
                URVA champions the &ldquo;One Village One Product&rdquo; (OVOP) initiative, providing conscious consumers with direct access to traditional Indian foods, palm jaggery, indigenous forest honey, organic Araku coffee, artisan textiles, handcrafted pottery, and native flora.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Eligibility & Account Responsibility
              </h2>
              <p>
                To place an order on URVA, you must be at least 18 years of age or accessing the site under the supervision of a parent or legal guardian who agrees to these terms. When registering or checking out as a guest:
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
                3. Products, Authentic Handmade Variations & Disclaimers
              </h2>
              <p>
                Our collections celebrate the rustic, unadulterated nature of rural India. Because our products are handcrafted or harvested using ancestral techniques without artificial stabilizers or synthetic dyes:
              </p>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200/80 space-y-2">
                <p className="font-semibold text-neutral-900 text-xs">
                  🌾 Natural Batch Variations:
                </p>
                <p className="text-xs text-neutral-600">
                  Subtle variations in color, texture, aroma, weave, or weight are natural hallmarks of authentic traditional jaggery, raw honey, single-origin coffee, handlooms, and clay crafts. These natural nuances do not constitute manufacturing defects.
                </p>
              </div>
              <p>
                We strive to display accurate descriptions, regional backgrounds, and images. However, actual packaging or minor visual aesthetics may vary slightly from the screen photos.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Pricing, Taxes & Promotional Offers
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  All prices listed on the website are in Indian National Rupees (INR) and are inclusive of applicable GST unless explicitly stated otherwise at checkout.
                </li>
                <li>
                  Shipping fees are calculated transparently and displayed prior to payment completion. Orders exceeding our free delivery threshold (e.g., ₹999) qualify for free standard shipping across eligible pin codes.
                </li>
                <li>
                  Promotional coupons (such as festive codes like <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 font-mono">URVA10</code>) are valid for specified timeframes and cannot be clubbed with unapproved offers or exchanged for cash.
                </li>
                <li>
                  We reserve the right to correct pricing errors that may inadvertently occur due to typographical or technical anomalies.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                5. Orders & Secure Payment Processing
              </h2>
              <p>
                Placement of an order constitutes an offer to purchase. An order is confirmed once payment has been successfully authorized and a digital confirmation receipt is issued via email or SMS.
              </p>
              <p>
                Payments on URVA are securely processed through authorized, PCI-DSS Level 1 compliant payment gateways (Razorpay), supporting UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and verified digital wallets. We do not store your complete card credentials or banking passwords on our servers.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                6. Shipping, Order Fulfillment & Delivery
              </h2>
              <p>
                Orders are processed and dispatched within 24 to 48 business hours. Estimated delivery timelines range from 2 to 7 business days depending on destination logistics. For detailed terms regarding tracking, regional delivery times, and damaged package guidelines, please consult our dedicated{' '}
                <Link to="/shipping-policy" className="text-[#E57A22] font-semibold hover:underline">
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
                You may request an order cancellation prior to dispatch by reaching out to our customer care team. For items received damaged, spoiled, or defective, claims must be registered within <strong>7 days of delivery</strong> accompanied by photographic or unboxing video proof. Full parameters are detailed in our{' '}
                <Link to="/refund-policy" className="text-[#E57A22] font-semibold hover:underline">
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
                All trademarks, logos, service marks, graphics, visual artisan photography, digital reel content, text, and software on <strong>URVA</strong> are the exclusive property of URVA or its respective cooperative licensors. Any unauthorized copying, reproduction, re-engineering, or commercial exploitation is strictly prohibited without prior written consent.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                9. Limitation of Liability & Disclaimers
              </h2>
              <p>
                To the fullest extent permitted by Indian law, URVA shall not be liable for any indirect, punitive, incidental, or consequential damages arising out of the use or inability to use this website, delay in delivery due to unforeseen weather/carrier strikes, or misuse of purchased food/botanical goods contrary to product instructions.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                10. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. In the event of any dispute, controversy, or claim arising out of these terms, the competent courts located in India shall have exclusive jurisdiction.
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
            <Link to="/privacy" className="text-[#E57A22] hover:underline">
              Next: Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
