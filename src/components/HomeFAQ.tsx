import React from 'react';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'How much is delivery?',
    answer: 'UK orders are tracked. Next Day Delivery is free on orders over £35; otherwise delivery is £3.75. Orders are usually dispatched within 1 working day.',
  },
  {
    question: 'What is your returns policy?',
    answer: 'For UK orders, email hello@skinofkorea.co.uk within 14 days of receiving your order to request a return. Approved items must be unopened, unused and in their original packaging. International orders are not eligible for returns.',
    href: '/pages/return-policy',
    linkLabel: 'Read our returns policy',
  },
  {
    question: 'What should I do if my order arrives damaged or faulty?',
    answer: 'Email hello@skinofkorea.co.uk within 30 days of delivery and include clear photos. The store policy provides a replacement for faulty items.',
    href: '/pages/return-policy',
    linkLabel: 'View the full policy',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Cancellations can only be processed before an order has shipped. Email hello@skinofkorea.co.uk with your order number as soon as possible.',
  },
  {
    question: 'Where can I find product information?',
    answer: 'Open a product page to see its available details and guidance. If you need help choosing a product, contact our team.',
    href: '/pages/contact',
    linkLabel: 'Contact us',
  },
];

const HomeFAQ: React.FC = () => (
  <section aria-labelledby="home-faq-heading" className="bg-[#fff8ef] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 text-center sm:mb-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8b451f] sm:text-[10px]">
          Here to help
        </p>
        <h2 id="home-faq-heading" className="mt-2 text-2xl font-medium text-[#2b211c] sm:text-3xl">
          Frequently asked <span className="italic text-[#8b451f]">questions</span>
        </h2>
        <p className="mt-2 text-xs text-[#2b211c]/65 sm:text-sm">
          Quick answers about shopping with Skin of Korea.
        </p>
      </header>

      <div className="divide-y divide-[#ead4be] border-y border-[#ead4be]">
        {faqs.map(({ question, answer, href, linkLabel }) => (
          <details key={question} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-[#2b211c] marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b451f] sm:py-5 sm:text-base">
              <span>{question}</span>
              <FaChevronDown aria-hidden="true" className="shrink-0 text-xs text-[#8b451f] transition-transform group-open:rotate-180" />
            </summary>
            <div className="max-w-3xl pb-5 pr-6 text-xs leading-6 text-[#2b211c]/75 sm:text-sm">
              <p>{answer}</p>
              {href && linkLabel && (
                <Link to={href} className="mt-2 inline-flex items-center gap-2 font-semibold text-[#8b451f] hover:underline">
                  {linkLabel}
                  <FaArrowRight aria-hidden="true" className="text-[10px]" />
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-[#2b211c]/65">
        Still need help?{' '}
        <Link to="/pages/contact" className="font-semibold text-[#8b451f] hover:underline">Get in touch</Link>
      </p>
    </div>
  </section>
);

export default HomeFAQ;
