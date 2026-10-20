import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaShieldHalved } from 'react-icons/fa6';

const PrivacyPolicy: React.FC = () => {
  usePageSEO({
    title: 'Privacy Policy | Skin of Korea UK',
    description: 'Understand how Skin of Korea UK protects your personal data, payment information, and privacy in compliance with UK GDPR.',
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
                <FaShieldHalved className="text-[#1f5133]" /> DATA PRIVACY & SAFETY
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              At <strong>Skin of Korea</strong> (
              <a href="https://skinofkorea.co.uk" className="text-[#1f5133] font-semibold hover:underline">
                https://skinofkorea.co.uk
              </a>
              ), we respect and protect the privacy of every visitor and customer. This policy outlines how your personal data is collected, handled, and kept confidential in full compliance with UK GDPR and the Data Protection Act 2018.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                1. Our Commitment to Data Protection
              </h2>
              <p>
                We process your personal information transparently and lawfully. We only collect the minimal personal data required to fulfill orders, deliver dispatch tracking alerts, provide customer assistance, and optimize your browsing experience. We never sell, rent, or trade your personal details to third parties for commercial marketing.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Information We Collect
              </h2>
              <p>When you browse or purchase on Skin of Korea, we may collect:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li><strong>Contact details:</strong> Your name, email address, UK delivery address, and telephone number for carrier updates.</li>
                <li><strong>Order records:</strong> Skincare items purchased, transaction references, delivery dates, and return/exchange inquiries.</li>
                <li><strong>Payment data:</strong> Secure payment tokens processed exclusively via certified PCI-DSS Level 1 payment processors. We never hold your full debit/credit card numbers on our servers.</li>
                <li><strong>Technical data:</strong> IP address, device type, and session cookies used solely for cart persistence and secure checkout verification.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. How We Use Your Data
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>To pack, dispatch, and track your skincare deliveries via Royal Mail and authorized UK delivery couriers.</li>
                <li>To send electronic receipts, order confirmations, and dispatch tracking notifications.</li>
                <li>To provide dedicated concierge support if you have questions about ingredient safety or product usage.</li>
                <li>To prevent fraudulent orders and maintain platform security.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Your Rights Under UK GDPR
              </h2>
              <p>
                Under UK data protection regulations, you hold full legal rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>The right to request access to the personal data we hold about you.</li>
                <li>The right to request correction of inaccurate or incomplete records.</li>
                <li>The right to request deletion of your account and personal history (Right to be Forgotten).</li>
                <li>The right to withdraw marketing consent at any time with one click.</li>
              </ul>
              <p className="mt-2 text-neutral-600">
                To exercise any of these rights, simply email our Data Privacy Officer at <a href="mailto:support@skinofkorea.co.uk" className="text-[#1f5133] font-semibold underline">support@skinofkorea.co.uk</a>.
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
            <Link to="/shipping-policy" className="text-[#1f5133] hover:underline">
              Next: Shipping & Delivery Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
