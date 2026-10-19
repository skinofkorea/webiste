import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FaBars, FaLock, FaExternalLinkAlt } from 'react-icons/fa';
import { usePageSEO } from '../../hooks/usePageSEO';

// ─── Admin password (client-side gate) ───────────────────────────────────────
const ADMIN_PASSWORD = 'miikorean@2026';
const SESSION_KEY = 'vh_admin_auth';

// ─── Password Gate ────────────────────────────────────────────────────────────
const AdminLoginGate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // Auto-pass if already authenticated via admin login page
  React.useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onSuccess();
    }
  }, [onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      input === ADMIN_PASSWORD || 
      input === 'urvaa@2026' || 
      input === 'urvaa@Admin2026' || 
      input === 'miikorean@Admin2026' || 
      input === 'julinacandles@2026'
    ) {
      sessionStorage.setItem(SESSION_KEY, '1');
      // For local/dev convenience: set a temporary admin token so API-protected admin
      // endpoints (which expect a 128-hex token) accept actions. This is only a
      // client-side convenience and should NOT be used in production.
      try {
        const temp = 'a'.repeat(128);
        localStorage.setItem('adminToken', temp);
      } catch (err) {
        console.warn('Could not set temp admin token', err);
      }
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 font-sans">
      <div
        className={`bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 w-full max-w-sm ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4 shadow-sm border border-neutral-800">
            <FaLock className="text-white text-lg" />
          </div>
          <img 
            src="https://www.miikorean.com/cdn/shop/files/Mii_Korean_Logo_46f0bcea-5297-4762-ade7-0f3998356de9_175x.png?v=1774335418" 
            alt="Mii Korean" 
            className="h-10 w-auto mb-3 object-contain" 
          />
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Admin Access</h1>
          <p className="text-xs text-neutral-500 mt-1 text-center">
            Enter the admin password to access the console.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="Enter admin password"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? 'border-red-400 focus:ring-red-300 bg-red-50 text-red-900'
                  : 'border-neutral-200 focus:ring-neutral-900/20 bg-neutral-50 focus:bg-white text-neutral-900'
              }`}
            />
            {error && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">
                Incorrect password. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
          >
            Unlock Console
          </button>
        </form>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

// ─── Admin Layout ─────────────────────────────────────────────────────────────
const AdminLayout: React.FC = () => {
  usePageSEO({
    title: 'Admin Dashboard | Mii Korean',
    description: 'Mii Korean Skincare product and order management',
    canonical: '/admin',
    noIndex: true,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const location = useLocation();

  const getHeaderMeta = () => {
    const path = location.pathname;
    if (path.includes('/admin/featured')) {
      return { section: 'Merchandising', title: 'Featured Showcase & Bestsellers' };
    }
    if (path.includes('/admin/products/new')) {
      return { section: 'Catalog', title: 'Add New Skincare Product' };
    }
    if (path.match(/\/admin\/products\/[^/]+$/)) {
      return { section: 'Catalog', title: 'Edit Skincare Product' };
    }
    if (path.includes('/admin/products')) {
      return { section: 'Catalog', title: 'Products Inventory (445)' };
    }
    if (path.includes('/admin/orders')) {
      return { section: 'Sales & Fulfillment', title: 'Customer Orders' };
    }
    if (path.includes('/admin/customers')) {
      return { section: 'Sales', title: 'Customer Directory' };
    }
    if (path.includes('/admin/banners')) {
      return { section: 'Marketing', title: 'Campaigns & Hero Banners' };
    }
    if (path.includes('/admin/coupons')) {
      return { section: 'Marketing', title: 'Discount Coupons & Promos' };
    }
    return { section: 'Store Overview', title: 'Operations Dashboard' };
  };

  const { section, title } = getHeaderMeta();

  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );

  if (!isAuthed) {
    return <AdminLoginGate onSuccess={() => setIsAuthed(true)} />;
  }

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-neutral-900 font-sans">
      {/* Sidebar wrapper */}
      <div className="fixed z-40">
        <AdminSidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col ${isCollapsed ? 'md:pl-20' : 'md:pl-64'} min-w-0 transition-all duration-300`}>

        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              <FaBars className="text-lg" />
            </button>
            {/* Desktop collapse / expand toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 hover:text-black transition-colors items-center justify-center"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <FaBars className="text-base" />
            </button>

            {/* Breadcrumb & Section Title */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium leading-none mb-1">
                <span>Mii Korean</span>
                <span>/</span>
                <span>{section}</span>
              </div>
              <h2 className="text-sm font-bold text-neutral-900 tracking-tight leading-none">
                {title}
              </h2>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Store Pill */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-medium transition"
              title="Open customer storefront in new tab"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Storefront (GBP £)</span>
              <FaExternalLinkAlt className="text-[10px] text-neutral-400" />
            </a>

            {/* Admin Badge */}
            <div className="text-right hidden md:block">
              <span className="block text-xs font-semibold text-neutral-900 leading-tight">Admin Console</span>
              <span className="block text-[10px] text-neutral-400 font-mono leading-tight">GBP Merchant</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white text-xs font-bold shadow-xs border border-neutral-700 shrink-0">
              <span>MK</span>
            </div>

            <button
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setIsAuthed(false);
              }}
              title="Lock admin session"
              className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaLock className="text-xs" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
