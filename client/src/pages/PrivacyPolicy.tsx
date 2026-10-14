import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaShieldHalved, FaLock } from 'react-icons/fa6';

const PrivacyPolicy: React.FC = () => {
  usePageSEO({
    title: 'Privacy Policy | URVA',
    description: 'Understand how URVA protects your personal data, payment information, and privacy when you shop authentic rural Indian goods.',
    canonical: '/privacy',
    noIndex: false,
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <LegalNav currentPath="/privacy" />

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-neutral-200/80 shadow-xs">
          {/* Header Banner */}
          <div className="border-b border-neutral-100 pb-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                <FaShieldHalved className="text-[#E57A22]" /> DATA PRIVACY & SAFETY
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              At <strong>URVA</strong> (
              <a href="https://urvaa.in" className="text-[#E57A22] font-semibold hover:underline">
                https://urvaa.in
              </a>
              ), we hold the trust of our customers and rural artisan partners in highest regard. This policy outlines how your personal information is gathered, safeguarded, and utilized.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                1. Introduction & Our Commitment
              </h2>
              <p>
                URVA is dedicated to safeguarding your privacy in compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection (DPDP) Act of India. We collect only the essential information necessary to provide seamless e-commerce services, process order deliveries, communicate tracking alerts, and provide responsive customer care.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Information We Collect
              </h2>
              <p>We collect information you explicitly provide when interacting with our platform:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200/80">
                  <h4 className="font-bold text-neutral-900 text-xs mb-1.5">
                    📦 Contact & Delivery Data
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Full name, shipping address, billing address, postal PIN code, mobile phone number, and email address for order dispatches.
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200/80">
                  <h4 className="font-bold text-neutral-900 text-xs mb-1.5">
                    💳 Order & Transaction Info
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Ordered products, cart details, total amount, timestamp, and unique gateway transaction reference IDs (no card numbers stored).
                  </p>
                </div>
              </div>
              <p>
                Additionally, like most digital platforms, we may collect non-identifiable technical data such as browser type, operating system, IP address, and referral URLs to ensure website stability and thwart cyber fraud.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. Purpose of Processing Your Personal Data
              </h2>
              <p>We use your personal data strictly for legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Processing, packing, and dispatching your orders with verified courier partners.</li>
                <li>Sending transactional order confirmations, tracking links, and dispatch notifications via Email, SMS, or WhatsApp.</li>
                <li>Providing customer support regarding replacements, refunds, or product inquiries.</li>
                <li>Complying with statutory GST invoicing, tax documentation, and Indian e-commerce regulations.</li>
                <li>Detecting and mitigating unauthorized activities, payment disputes, or fraudulent checkouts.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <FaLock className="text-emerald-600 text-base" />
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  4. Payment Information & 100% Secure Processing
                </h2>
              </div>
              <p>
                All online payments on URVA are processed via <strong>Razorpay</strong>, a premier PCI-DSS Level 1 compliant gateway. 
              </p>
              <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-xl text-emerald-950 text-xs leading-relaxed space-y-1">
                <span className="font-bold block">🔒 Zero Card Storage Policy:</span>
                URVA servers never receive, store, or view your sensitive Credit/Debit Card numbers, CVV codes, UPI PINs, or Net Banking credentials. All transactional data is transmitted directly through encrypted 256-bit SSL connections to certified banking servers.
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                5. Data Sharing & Third-Party Disclosure
              </h2>
              <p className="font-medium text-neutral-900">
                We maintain a strict policy: We never sell, rent, monetize, or trade your personal information to third-party marketing brokers.
              </p>
              <p>We disclose information only to the following essential service partners solely to execute your order:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  <strong>Logistics & Courier Partners:</strong> Name, phone number, and destination address provided to delivery networks (e.g., Shiprocket, Delhivery, BlueDart, India Post) to deliver your parcels.
                </li>
                <li>
                  <strong>Payment Processors:</strong> Necessary transaction tokens sent to Razorpay to verify payment completion.
                </li>
                <li>
                  <strong>Legal Authorities:</strong> When required by lawful court subpoenas, judicial orders, or national security statutes.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                6. Cookies & Local Session Storage
              </h2>
              <p>
                We use functional cookies and browser local storage strictly to remember items in your shopping basket, retain customer login sessions, and save interface preferences. You may configure your browser to decline cookies, though doing so may prevent certain e-commerce checkout features from functioning smoothly.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                7. Your Data Protection Rights
              </h2>
              <p>Under Indian data protection frameworks, you are entitled to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Request access to the personal data we maintain about you.</li>
                <li>Request correction of inaccurate or incomplete shipping information.</li>
                <li>Request account deletion and removal of non-statutory records by writing to our privacy desk.</li>
                <li>Opt out of non-essential promotional SMS/emails at any time via the unsubscribe link or contacting support.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                8. Data Retention & Policy Updates
              </h2>
              <p>
                We retain transaction and order records for the duration required to satisfy customer care obligations, resolve warranty/return inquiries, and fulfill statutory tax retention mandates under Indian law.
              </p>
              <p>
                We may periodically update this policy to mirror technological advancements or legislative adjustments. Any updates will be published on this page with an updated &ldquo;Effective Date&rdquo;.
              </p>
            </section>
          </div>

          {/* Contact & Grievance Card */}
          <LegalContactCard />

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
            <Link to="/terms" className="text-neutral-500 hover:text-black transition">
              ← Previous: Terms & Conditions
            </Link>
            <Link to="/shipping-policy" className="text-[#E57A22] hover:underline">
              Next: Shipping & Delivery Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
