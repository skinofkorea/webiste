import React, { useEffect, useState } from 'react';
import { FaBars, FaSearch, FaShoppingBag, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';

const logo = 'https://www.miikorean.com/cdn/shop/files/Mii_Korean_Logo_46f0bcea-5297-4762-ade7-0f3998356de9_175x.png?v=1774335418';
const announcements = [
  {
    icon: 'https://www.justmylook.com/cdn/shop/files/Trustpilot-05_7863b31f-1bbf-4657-85d3-de5dcd0dc26d.svg?v=1785851510',
    iconClass: 'h-4 w-auto',
    text: 'Excellent 4.5 out of 5',
  },
  {
    icon: 'https://www.justmylook.com/cdn/shop/files/delivery.svg?v=1733758420',
    iconClass: 'h-4 w-auto brightness-0 invert',
    text: 'Free delivery when you spend £35',
  },
  {
    icon: '',
    iconClass: '',
    text: 'Next-day delivery available',
  },
  {
    icon: '',
    iconClass: '',
    text: 'Visit us at Meadowhall or Trafford Centre',
  },
];

const MiikoreanHeader: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAnnouncementIndex((current) => (current + 1) % announcements.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  const searchProducts = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const links = [
    { to: '/products', label: 'Shop all' },
    { to: '/pages/collections', label: 'Brands & collections' },
    { to: '/pages/ai-skin-analysis', label: 'AI skin analysis' },
    { to: '/pages/learn-about-k-beauty', label: 'Learn about K-beauty' },
    { to: '/pages/about-us', label: 'About us' },
  ];

  return (
    <>
      <div className="miikorean-announcement overflow-hidden bg-[#111111] py-2 text-white">
        <div className="announcement-marquee hidden w-max text-[10px] font-bold uppercase tracking-[0.15em] md:flex sm:text-xs">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-10 px-5">
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement.text}>
                  {index > 0 && <span aria-hidden="true" className="text-emerald-400">✦</span>}
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {announcement.icon && <img src={announcement.icon} alt="" className={announcement.iconClass} />}
                    <span>{announcement.text}</span>
                  </div>
                </React.Fragment>
              ))}
              <span aria-hidden="true" className="text-emerald-400">✦</span>
            </div>
          ))}
        </div>
        <div className="mx-auto flex min-h-5 items-center justify-center px-4 text-[10px] font-bold uppercase tracking-[0.12em] md:hidden sm:text-xs" aria-live="polite" aria-atomic="true">
          <div key={announcementIndex} className="announcement-slide flex items-center gap-2 whitespace-nowrap">
            <span aria-hidden="true" className="text-emerald-400">✦</span>
            {announcements[announcementIndex].icon && (
              <img
                src={announcements[announcementIndex].icon}
                alt=""
                className={announcements[announcementIndex].iconClass}
              />
            )}
            <span>{announcements[announcementIndex].text}</span>
            <span aria-hidden="true" className="text-emerald-400">✦</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-amber-100 bg-[#fff8ee]/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-3 sm:h-[76px] sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-4">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} className="p-2 text-lg text-[#111111] sm:text-xl">
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
            <button type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="Search products" className="p-2 text-lg text-[#111111] sm:text-xl lg:hidden">
              <FaSearch />
            </button>
          </div>

          <Link to="/" aria-label="Mii Korean Skincare home" className="absolute left-1/2 -translate-x-1/2">
            <img src={logo} alt="Mii Korean Skincare" className="h-12 w-auto object-contain sm:h-16" />
          </Link>

          <div className="flex items-center gap-1 sm:gap-4">
            <form onSubmit={searchProducts} role="search" className="hidden w-[min(28vw,360px)] items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-2 transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 lg:flex">
              <FaSearch aria-hidden="true" className="shrink-0 text-sm text-neutral-400" />
              <label htmlFor="header-product-search" className="sr-only">Search products</label>
              <input
                id="header-product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skincare, brands..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              <button type="submit" aria-label="Submit product search" className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-700">
                Search
              </button>
            </form>
            <Link to="/cart" aria-label={`Shopping bag, ${cartCount} items`} className="relative p-2 text-lg text-[#111111] transition hover:text-neutral-500 sm:text-xl">
              <FaShoppingBag />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111111] px-1 text-[9px] font-semibold text-white sm:-right-1 sm:-top-1 sm:h-5 sm:min-w-5 sm:text-[10px]">{cartCount}</span>
            </Link>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={searchProducts} className="border-t border-amber-100 bg-[#fff8ee] px-4 py-3 sm:px-8">
            <label className="mx-auto flex min-h-11 max-w-3xl items-center gap-3 rounded-full border border-neutral-300 px-4 py-2.5 transition focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-200">
              <FaSearch className="text-neutral-400" />
              <span className="sr-only">Search products</span>
              <input autoFocus type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skincare, brands and ingredients" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400" />
              <button type="submit" className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 sm:text-sm">Search</button>
            </label>
          </form>
        )}

        {menuOpen && (
          <nav aria-label="Main navigation" className="border-t border-amber-100 bg-[#fff8ee] px-5 py-4 shadow-lg sm:px-8">
            <div className="mx-auto grid max-w-5xl gap-1 sm:grid-cols-2 lg:grid-cols-5">
              {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100">{link.label}</Link>)}
              <Link to="/pages/contact" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100">Contact & stores</Link>
            </div>
          </nav>
        )}
      </header>

    </>
  );
};

export default MiikoreanHeader;
