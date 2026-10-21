import React from 'react';
import { FaArrowUpRightFromSquare, FaEnvelope, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const paymentMethods = [
  { name: 'Link', className: 'bg-[#b8f3e3] text-[#17241f]' },
  { name: 'Apple Pay', className: 'bg-white text-black' },
  { name: 'Google Pay', className: 'bg-white text-[#4285f4]' },
  { name: 'Maestro', className: 'bg-white text-[#111827]' },
  { name: 'Mastercard', className: 'bg-white text-[#111827]' },
  { name: 'PayPal', className: 'bg-white text-[#0755a5]' },
  { name: 'Shop Pay', className: 'bg-[#5a31ed] text-white' },
  { name: 'Visa', className: 'bg-[#1434cb] text-white' },
  { name: 'Klarna', className: 'bg-[#ffb3c7] text-black' },
];

const Footer: React.FC = () => (
  <footer className="skinofkorea-footer bg-gradient-to-b from-[#fffaf4] to-[#f4e8da] text-[#2b211c]">
    <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-8 sm:pt-8 lg:px-10">
      <Link
        to="/"
        aria-label="Skin of Korea home"
        className="block text-center py-4 group"
      >
        <img
          src="/images/skin-of-korea-logo.png"
          alt="Skin of Korea"
          className="mx-auto h-20 sm:h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <span className="sr-only">Skin of Korea</span>
      </Link>

      <div className="mt-6 grid gap-6 border-t border-[#2b211c]/15 py-6 text-[11px] sm:grid-cols-2 sm:gap-8 sm:py-7 sm:text-xs lg:grid-cols-[0.65fr_1.25fr_1fr_1fr]">
        <nav aria-label="Explore">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2b211c]/60">Explore</h2>
          <ul className="mt-2.5 space-y-2">
            <li><Link to="/products" className="transition hover:text-[#8b451f]">Shop all products</Link></li>
            <li><Link to="/pages/collections" className="transition hover:text-[#8b451f]">Brands & collections</Link></li>
            <li><Link to="/pages/learn-about-k-beauty" className="transition hover:text-[#8b451f]">Learn about K-beauty</Link></li>
            <li><Link to="/pages/about-us" className="transition hover:text-[#8b451f]">About Skin of Korea</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2b211c]/60">A little skin inspiration</h2>
          <p className="mt-2.5 max-w-sm leading-5 text-[#2b211c]/70">
            Discover Korean skincare favourites, thoughtful ingredients and routines made to feel like you.
          </p>
          <Link to="/products" className="mt-3 inline-flex items-center gap-2 font-semibold text-[#8b451f] transition hover:text-[#2b211c]">
            Explore the collection
            <FaArrowUpRightFromSquare aria-hidden="true" className="text-[9px]" />
          </Link>
        </div>

        <nav aria-label="Customer care">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2b211c]/60">Customer care</h2>
          <ul className="mt-2.5 space-y-2">
            <li><Link to="/pages/shipping-policy" className="transition hover:text-[#8b451f]">Shipping & delivery</Link></li>
            <li><Link to="/pages/return-policy" className="transition hover:text-[#8b451f]">Returns policy</Link></li>
            <li><Link to="/my-orders" className="transition hover:text-[#8b451f]">Order history</Link></li>
            <li><Link to="/pages/contact" className="transition hover:text-[#8b451f]">Contact us</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#2b211c]/60">Stay connected</h2>
          <a href="mailto:hello@skinofkorea.com" className="mt-2.5 inline-flex items-center gap-2 transition hover:text-[#8b451f]">
            <FaEnvelope aria-hidden="true" /> hello@skinofkorea.com
          </a>
          <div className="mt-3 flex gap-4">
            <a href="https://www.instagram.com/skinofkorea/" target="_blank" rel="noreferrer" aria-label="Skin of Korea on Instagram" className="transition hover:text-[#8b451f]">
              <FaInstagram aria-hidden="true" size={16} />
            </a>
            <a href="https://www.tiktok.com/@skinofkorea" target="_blank" rel="noreferrer" aria-label="Skin of Korea on TikTok" className="transition hover:text-[#8b451f]">
              <FaTiktok aria-hidden="true" size={16} />
            </a>
          </div>
          <p className="mt-3 leading-5 text-[#2b211c]/60">Visit us at Meadowhall or Trafford Centre.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#2b211c]/15 py-3 text-[9px] text-[#2b211c]/60 sm:flex-row sm:items-center sm:justify-between sm:text-[10px]">
        <p>© {new Date().getFullYear()} Skin of Korea Ltd. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="transition hover:text-[#8b451f]">Privacy policy</Link>
          <span aria-hidden="true">|</span>
          <Link to="/terms" className="transition hover:text-[#8b451f]">Terms & conditions</Link>
        </div>
      </div>
      <ul aria-label="Payment methods" className="flex flex-wrap items-center justify-center gap-1.5 pb-4 sm:justify-end">
        {paymentMethods.map(({ name, className }) => (
          <li
            key={name}
            aria-label={name}
            title={name}
            className={`flex h-6 min-w-9 items-center justify-center gap-0.5 rounded-[3px] px-1.5 text-[8px] font-extrabold leading-none tracking-tight shadow-sm ${className}`}
          >
            {name === 'Link' && (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 8 2-2a4 4 0 0 1 6 0l1 1a4 4 0 0 1 0 6l-2 2M15 16l-2 2a4 4 0 0 1-6 0l-1-1a4 4 0 0 1 0-6l2-2m-1 5 8-8" />
              </svg>
            )}
            {name === 'Apple Pay' && (
              <>
                <svg aria-hidden="true" viewBox="0 0 16 18" className="h-3.5 w-3.5 fill-current">
                  <path d="M12.7 9.5c0-2 1.6-3 1.7-3.1a3.7 3.7 0 0 0-2.9-1.6c-1.2-.1-2.4.7-3  .7-.7 0-1.7-.7-2.8-.7a4.1 4.1 0 0 0-3.4 2.1c-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.2s-2.3-.9-2.3-3.8ZM10.7 3.5A3.8 3.8 0 0 0 11.6.7a3.9 3.9 0 0 0-2.5 1.3 3.6 3.6 0 0 0-.9 2.7 3.2 3.2 0 0 0 2.5-1.2Z" transform="translate(-1 -0.5) scale(.95)" />
                </svg>
                <span>Pay</span>
              </>
            )}
            {name === 'Google Pay' && (
              <>
                <span className="font-black text-[#4285f4]">G</span>
                <span className="text-[#3c4043]">Pay</span>
              </>
            )}
            {name === 'Maestro' && (
              <svg aria-hidden="true" viewBox="0 0 28 18" className="h-4 w-6">
                <circle cx="10" cy="9" r="7" fill="#0099df" />
                <circle cx="18" cy="9" r="7" fill="#ed1c24" fillOpacity=".92" />
              </svg>
            )}
            {name === 'Mastercard' && (
              <svg aria-hidden="true" viewBox="0 0 28 18" className="h-4 w-6">
                <circle cx="10" cy="9" r="7" fill="#eb001b" />
                <circle cx="18" cy="9" r="7" fill="#f79e1b" fillOpacity=".95" />
              </svg>
            )}
            {name === 'PayPal' && (
              <svg aria-hidden="true" viewBox="0 0 16 18" className="h-4 w-3.5 fill-current">
                <path d="M4 1h6.3c3.2 0 4.8 1.8 4.3 4.6-.5 2.8-2.3 4.2-5.5 4.2H6.8l-.9 5.1H2.5L4 1Zm3.4 3-.6 3.3h2c1.1 0 1.7-.5 1.9-1.6.2-1.1-.3-1.7-1.5-1.7H7.4Z" />
                <path d="M2.7 7.1H1.4L0 17h3l.4-2.4.5-3.1h2.2c3.4 0 5.3-1.6 5.8-4.5H7.5c-2 0-3.7.1-4.8.1Z" opacity=".72" />
              </svg>
            )}
            {name === 'Shop Pay' && (
              <>
                <span className="font-medium">shop</span>
                <span>Pay</span>
              </>
            )}
            {name === 'Visa' && <span className="text-[10px] italic tracking-[-0.06em]">VISA</span>}
            {name === 'Klarna' && <span className="text-[8px] font-black">Klarna.</span>}
          </li>
        ))}
      </ul>
    </div>
  </footer>
);

export default Footer;
