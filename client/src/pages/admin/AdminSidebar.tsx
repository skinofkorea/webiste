import React from 'react';
import { 
  FaBox, 
  FaClipboardList, 
  FaMoneyCheckAlt, 
  FaTachometerAlt, 
  FaTimes, 
  FaUsers, 
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaStar,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaPlus
} from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('vh_admin_auth');
    navigate('/admin/login');
  };

  const navSections = [
    {
      title: 'Store Overview',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
      ]
    },
    {
      title: 'Catalog & Merchandising',
      items: [
        { to: '/admin/products', label: 'Products (445)', icon: FaBox },
        { to: '/admin/featured', label: 'Featured & Bestsellers', icon: FaStar },
        { to: '/admin/products/new', label: 'Add Skincare Product', icon: FaPlus },
      ]
    },
    {
      title: 'Orders & Sales',
      items: [
        { to: '/admin/orders', label: 'Customer Orders', icon: FaClipboardList },
        { to: '/admin/customers', label: 'Customer Directory', icon: FaUsers },
      ]
    },
    {
      title: 'Marketing & Storefront',
      items: [
        { to: '/admin/banners', label: 'Hero Banners & Campaigns', icon: FaImage },
        { to: '/admin/coupons', label: 'Coupons & Promos', icon: FaMoneyCheckAlt },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } w-64 bg-[#111111] text-neutral-200 ${
          isCollapsed ? 'p-3' : 'p-5'
        } flex flex-col justify-between border-r border-neutral-800 shadow-2xl z-40 transform transition-all duration-300 ease-in-out md:translate-x-0 font-sans ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar">
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
          <div className={`mb-6 pb-5 border-b border-neutral-800 ${isCollapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <Link 
                to="/admin/dashboard" 
                onClick={() => { if (isSidebarOpen) toggleSidebar(); }} 
                className="group block"
                title="Mii Korean Admin Dashboard"
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-neutral-700 shadow-xs shrink-0">
                    <img
                      src="https://www.miikorean.com/cdn/shop/files/Mii_Korean_Logo_46f0bcea-5297-4762-ade7-0f3998356de9_175x.png?v=1774335418"
                      alt="Mii Korean Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {!isCollapsed && (
                    <div>
                      <h1 className="text-base font-bold text-white tracking-tight group-hover:text-neutral-300 transition-colors leading-tight font-sans">
                        Mii Korean
                      </h1>
                      <span className="text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-semibold block mt-0.5">
                        Skincare Admin
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Desktop toggle button in header when expanded */}
              {!isCollapsed && (
                <button
                  onClick={toggleCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <FaChevronLeft size={13} />
                </button>
              )}
            </div>
            
            {/* Quick link to storefront */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3.5 relative group flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 hover:text-white transition border border-neutral-800`}
              title="View Live Store"
            >
              {isCollapsed ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div className="hidden md:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>View Live Store</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>View Live Store</span>
                  </span>
                  <FaExternalLinkAlt className="text-[10px] text-neutral-500 group-hover:text-white transition" />
                </>
              )}
            </a>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-4">
            {navSections.map((section, sIdx) => (
              <div key={section.title || sIdx} className="space-y-1">
                {!isCollapsed ? (
                  <p className="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 select-none">
                    {section.title}
                  </p>
                ) : (
                  sIdx > 0 && <div className="w-6 h-px bg-neutral-800 mx-auto my-2" />
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => { if (isSidebarOpen) toggleSidebar(); }}
                        className={({ isActive }) =>
                          `relative group flex items-center ${
                            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
                          } rounded-xl transition-all duration-200 text-xs font-medium ${
                            isActive
                              ? 'bg-white text-black font-semibold shadow-xs'
                              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                          }`
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className={`${isCollapsed ? 'text-base' : 'text-sm'} shrink-0`} />
                        {!isCollapsed && <span>{item.label}</span>}

                        {/* Floating tooltip when collapsed */}
                        {isCollapsed && (
                          <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center">
                            {item.label}
                          </div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer / Account section */}
        <div className="pt-4 border-t border-neutral-800 space-y-2 shrink-0">
          <div
            className={`relative group ${
              isCollapsed ? 'flex justify-center p-2' : 'px-3 py-2 flex items-center gap-3'
            } rounded-xl bg-neutral-900 border border-neutral-800/80`}
          >
            <div className="w-8 h-8 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-xs border border-neutral-700 shrink-0">
              MK
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">Administrator</p>
                <p className="text-[10px] text-neutral-400 truncate">Store Manager</p>
              </div>
            )}
            {isCollapsed && (
              <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center">
                Administrator
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`relative group flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-xl transition duration-200 text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 w-full`}
            title="Sign Out"
          >
            <FaSignOutAlt className="text-xs shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && (
              <div className="hidden md:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 text-red-400 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-neutral-700 pointer-events-none items-center">
                Sign Out
              </div>
            )}
          </button>

          {/* Desktop collapse / expand toggle bar */}
          <button
            onClick={toggleCollapse}
            className={`hidden md:flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
            } rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors text-xs font-medium w-full border border-neutral-800/60 mt-1`}
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


