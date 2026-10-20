import React from 'react';
import { 
  FaBox, 
  FaClipboardList, 
  FaTicketAlt, 
  FaTachometerAlt, 
  FaTimes, 
  FaUsers, 
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaStar,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaCreditCard
} from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAllProductsQuery } from '../../redux/api/product.api';
import { useGetStatsQuery } from '../../redux/api/stats.api';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  isCollapsed, 
  toggleCollapse 
}) => {
  const navigate = useNavigate();

  // Dynamic counts for live badges
  const { data: productsData } = useAllProductsQuery({ page: 1, limit: 10 });
  const { data: statsData } = useGetStatsQuery();

  const totalProducts = productsData?.totalProducts ?? 0;
  const totalOrders = statsData?.stats?.totalOrders ?? 0;
  const totalCoupons = statsData?.stats?.totalCoupons ?? 0;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('vh_admin_auth');
    navigate('/admin/login');
  };

  const navSections = [
    {
      title: 'Store',
      items: [
        { 
          to: '/admin/dashboard', 
          label: 'Dashboard', 
          icon: FaTachometerAlt 
        },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { 
          to: '/admin/products', 
          label: 'Products', 
          icon: FaBox,
          badge: totalProducts > 0 ? totalProducts : undefined,
        },
        { 
          to: '/admin/featured', 
          label: 'Featured Products', 
          icon: FaStar,
        },
      ]
    },
    {
      title: 'Sales',
      items: [
        { 
          to: '/admin/orders', 
          label: 'Orders', 
          icon: FaClipboardList,
          badge: totalOrders > 0 ? totalOrders : undefined,
        },
        { 
          to: '/admin/customers', 
          label: 'Customers', 
          icon: FaUsers 
        },
        { 
          to: '/admin/transactions', 
          label: 'Transactions', 
          icon: FaCreditCard 
        },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { 
          to: '/admin/banners', 
          label: 'Hero Banners', 
          icon: FaImage 
        },
        { 
          to: '/admin/coupons', 
          label: 'Coupons & Promos', 
          icon: FaTicketAlt,
          badge: totalCoupons > 0 ? totalCoupons : undefined,
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } w-64 bg-[#111111] text-neutral-200 ${
          isCollapsed ? 'p-3' : 'p-4'
        } flex flex-col justify-between border-r border-neutral-800 shadow-2xl z-40 transform transition-all duration-300 ease-in-out md:translate-x-0 font-sans select-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Scrollable Navigation Container without any scrollbar */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col min-h-0">
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end mb-2">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Close sidebar"
            >
              <FaTimes size={18} />
            </button>
          </div>
          
          {/* Brand Header */}
          <div className={`mb-4 pb-4 border-b border-neutral-800 ${isCollapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <Link 
                to="/admin/dashboard" 
                onClick={() => { if (isSidebarOpen) toggleSidebar(); }} 
                className="group block"
                title="Skin of Korea Admin"
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-neutral-700 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src="/images/skin-of-korea-logo.png"
                      alt="Skin of Korea Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0">
                      <h1 className="text-sm font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors leading-tight truncate">
                        Skin of Korea
                      </h1>
                      <span className="text-[10px] text-neutral-400 tracking-[0.16em] uppercase font-semibold block mt-0.5">
                        Admin Console
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Desktop collapse button in header */}
              {!isCollapsed && (
                <button
                  onClick={toggleCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <FaChevronLeft size={12} />
                </button>
              )}
            </div>
            
            {/* Quick link to live customer storefront */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 relative group flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 hover:text-white transition border border-neutral-800`}
              title="Open customer live storefront in new tab"
            >
              {isCollapsed ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>View Customer Storefront</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium">Live Storefront</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400 group-hover:text-amber-300">
                    <span>GBP £</span>
                    <FaExternalLinkAlt className="text-[9px]" />
                  </span>
                </>
              )}
            </a>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-4 flex-1">
            {navSections.map((section, sIdx) => (
              <div key={section.title} className="space-y-1">
                {!isCollapsed ? (
                  <p className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 select-none">
                    {section.title}
                  </p>
                ) : (
                  sIdx > 0 && <div className="w-6 h-px bg-neutral-800 mx-auto my-2" />
                )}

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => { if (isSidebarOpen) toggleSidebar(); }}
                        className={({ isActive }) =>
                          `relative group flex items-center ${
                            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                          } rounded-xl transition-all duration-200 text-xs font-medium ${
                            isActive
                              ? 'bg-white text-neutral-950 font-semibold shadow-xs'
                              : 'text-neutral-400 hover:bg-neutral-850 hover:text-white'
                          }`
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`${isCollapsed ? 'text-base' : 'text-sm'} shrink-0 ${
                                isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-white'
                              }`} />
                              {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </div>

                            {/* Badge */}
                            {!isCollapsed && item.badge !== undefined && (
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                                isActive 
                                  ? 'bg-neutral-900 text-white' 
                                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                              }`}>
                                {item.badge}
                              </span>
                            )}

                            {/* Floating tooltip when sidebar is collapsed */}
                            {isCollapsed && (
                              <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center gap-2">
                                <span>{item.label}</span>
                                {item.badge !== undefined && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer / Account Section */}
        <div className="pt-3 border-t border-neutral-800 space-y-1.5 shrink-0">
          <button
            onClick={handleLogout}
            className={`relative group flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            } rounded-xl transition duration-200 text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 w-full cursor-pointer`}
            title="Sign Out"
          >
            <FaSignOutAlt className="text-xs shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && (
              <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 text-rose-400 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center">
                Sign Out
              </div>
            )}
          </button>

          {/* Desktop collapse / expand toggle bar */}
          <button
            onClick={toggleCollapse}
            className={`hidden md:flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-1.5'
            } rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-xs font-medium w-full border border-neutral-800 mt-1 cursor-pointer`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <FaChevronRight className="text-xs" />
            ) : (
              <>
                <span className="text-[11px] text-neutral-400">Collapse Menu</span>
                <FaChevronLeft className="text-xs text-neutral-400" />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
