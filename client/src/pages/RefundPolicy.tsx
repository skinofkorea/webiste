import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';
import { LegalNav, LegalContactCard } from '../components/legal/LegalNav';
import { FaArrowRotateLeft, FaCircleCheck } from 'react-icons/fa6';

const RefundPolicy: React.FC = () => {
  usePageSEO({
    title: 'Refund & Returns Policy | URVA',
    description: 'Explore URVA 7-day hassle-free replacement, return, and refund policy for traditional Indian food, handlooms, and handicrafts.',
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
                <FaArrowRotateLeft className="text-[#E57A22]" /> RETURNS & REFUND COMMITMENT
              </span>
              <span className="text-xs text-neutral-400">Effective from October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Refund & Return Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
              At <strong>URVA</strong>, our mission is to deliver authentic rural traditions with uncompromising quality. We want you to experience complete satisfaction with every product delivered from our artisan and farmer cooperatives.
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
                  7-Day Hassle-Free Resolution Guarantee
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  If any product arrives damaged, leaked, defective, or incorrect, report it within <strong>7 days of delivery</strong> for a prompt replacement or 100% full refund.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-neutral-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                1. Return & Replacement Eligibility
              </h2>
              <p>You are fully eligible for a free replacement or 100% refund under the following conditions:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  <strong>Transit Damage:</strong> The product package, glass container, pottery, or plant arrived broken, leaked, or shattered during shipping.
                </li>
                <li>
                  <strong>Wrong Item Delivered:</strong> You received an item distinct from what was confirmed on your invoice.
                </li>
                <li>
                  <strong>Perishable Spoilage:</strong> Traditional food, sweet, or jaggery items arrived spoiled, compromised, or expired.
                </li>
                <li>
                  <strong>Manufacturing Defect:</strong> Handlooms or craft items have severe structural tears, defects, or missing components.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                2. Category-Specific Return Guidelines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5">
                  <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    🍯 Foods, Sweets & Honey (Perishables)
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Due to food safety and hygiene protocols, food items do not need to be physically returned. If damaged or spoiled in transit, we issue an immediate replacement or full refund upon photographic verification.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5">
                  <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    🧵 Handlooms, Sarees & Textiles
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Eligible for replacement within 7 days. Textiles must remain unused, unwashed, and in original condition with intact folds and brand tags.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5">
                  <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    🏺 Terracotta, Pottery & Handicrafts
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    If an artisan craft arrives cracked or shattered during courier transit, a replacement or refund is promptly authorized with photo/video proof.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5">
                  <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    🌱 Live Nursery Plants
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    If a live botanical arrives completely withered or dead on delivery, submit an unboxing picture within 48 hours for a prompt healthy replacement.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                3. How to Initiate a Return or Replacement (Simple 3 Steps)
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
                <li>
                  <strong>Contact Us within 7 Days:</strong> Email us at{' '}
                  <a href="mailto:urvaaofficial@gmail.com" className="text-[#E57A22] font-semibold hover:underline">
                    urvaaofficial@gmail.com
                  </a>{' '}
                  or WhatsApp us at{' '}
                  <a href="https://wa.me/919494957576" className="text-[#E57A22] font-semibold hover:underline">
                    +91 94949 57576
                  </a>
                  .
                </li>
                <li>
                  <strong>Share Order Details:</strong> Mention your <strong>Order ID</strong> along with clear photos or a short video showing the outer shipping label and the damaged/defective product.
                </li>
                <li>
                  <strong>Resolution within 24 Hours:</strong> Our customer support desk verifies the claim and will either dispatch a fresh replacement parcel immediately or initiate an online refund.
                </li>
              </ol>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                4. Refund Timelines & Payment Method
              </h2>
              <p>
                Once an authorized refund is approved:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>
                  <strong>Original Payment Mode:</strong> The refund is credited directly to the original source (Credit/Debit Card, UPI ID, Net Banking, or Wallet) through Razorpay.
                </li>
                <li>
                  <strong>Bank Clearance Duration:</strong> Refunds typically reflect in your bank account within <strong>5 to 7 business days</strong> depending on your issuing bank&rsquo;s clearing protocols.
                </li>
                <li>
                  <strong>Confirmation:</strong> You will receive an automated refund transaction reference ID via SMS/Email once initiated.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                5. Order Cancellation Guidelines
              </h2>
              <p>
                You may request an immediate 100% order cancellation at any time <strong>before your package is dispatched</strong> from our facility. Please message or call support as soon as possible.
              </p>
              <p>
                If your order has already been picked up and handed to the courier partner with an active AWB, cancellation is no longer possible in transit. In such cases, you may reject the parcel upon delivery attempt, and a refund will be processed once the return parcel is logged.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                6. Non-Refundable Scenarios
              </h2>
              <p>Refunds and returns cannot be accepted for:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Claims initiated after 7 calendar days from package delivery.</li>
                <li>Products returned in used, washed, or altered state without original packaging.</li>
                <li>Subjective natural batch variations inherent to unadulterated artisanal goods (e.g., natural variations in raw jaggery hue or tribal handloom weave patterns).</li>
                <li>Incorrect delivery address provided by customer leading to prolonged delivery failure.</li>
              </ul>
            </section>
          </div>

          {/* Contact & Grievance Card */}
          <LegalContactCard />

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
            <Link to="/shipping-policy" className="text-neutral-500 hover:text-black transition">
              ← Previous: Shipping & Delivery Policy
            </Link>
            <Link to="/terms" className="text-[#E57A22] hover:underline">
              Return to Terms & Conditions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
