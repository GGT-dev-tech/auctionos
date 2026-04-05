import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { AuthService } from '../services/auth.service';

const ClientLayout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const user = AuthService.getCurrentUser();
  const userDisplayName = user?.email ? user.email.split('@')[0] : 'Client';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  type DropdownItem = { label: string; path: string };
  type NavItem = {
    icon: string;
    label: string;
    path?: string;
    end?: boolean;
    dropdown?: DropdownItem[];
    cta?: boolean;
  };

  const navItems: NavItem[] = [
    { icon: 'home', label: 'Home', path: '/client', end: true },
    { icon: 'campaign', label: 'Live Auctions', path: '/client/auctions' },
    { icon: 'location_on', label: 'Property Search', path: '/client/properties' },
    { icon: 'list_alt', label: 'My Lists', path: '/client/lists' },
    { icon: 'info', label: 'About', path: '/client/about' },
    { icon: 'contact_support', label: 'Contact', path: '/client/support' },
    {
      icon: 'hub',
      label: 'Connect',
      dropdown: [
        { label: 'Training', path: '/client/training' },
        { label: 'Community', path: '/client/community' },
        { label: 'Groups', path: '/client/groups' },
      ],
    },
    {
      icon: 'manage_accounts',
      label: 'Account Support',
      dropdown: [
        { label: 'Change Password', path: '/client/change-password' },
        { label: 'Contact Support', path: '/client/contact-support' },
        { label: 'Cancel Subscription', path: '/client/cancel-subscription' },
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 font-display flex flex-col">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-[#1a2634] border-b border-[#e7ecf3] dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Brand */}
              <div
                className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/client')}
              >
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="text-[#0d131b] dark:text-white text-lg font-bold hidden md:block">
                  GoAuct
                </span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:ml-6 md:flex md:items-center md:gap-0.5">
                {navItems.map((item) => (
                  <div key={item.label} className="relative group">
                    {item.dropdown ? (
                      <>
                        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span>{item.label}</span>
                          <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </div>
                        {/* Dropdown */}
                        <div className="absolute left-0 top-full w-52 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                          {item.dropdown.map((dropItem) => (
                            <NavLink
                              key={dropItem.path}
                              to={dropItem.path}
                              className={({ isActive }) =>
                                `block px-4 py-2 text-sm transition-colors ${isActive
                                  ? 'bg-blue-50 text-primary dark:bg-slate-700 dark:text-blue-400 font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`
                              }
                            >
                              {dropItem.label}
                            </NavLink>
                          ))}
                        </div>
                      </>
                    ) : (
                      <NavLink
                        to={item.path!}
                        end={item.end}
                        className={({ isActive }) =>
                          `inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                            ? 'bg-blue-50 text-primary dark:bg-blue-900/40 dark:text-blue-300'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    )}
                  </div>
                ))}

                {/* Upgrade CTA */}
                <Link
                  to="/signup"
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                  Upgrade Trial
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{userDisplayName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">Client</span>
              </div>
              <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-primary dark:text-blue-300 font-bold cursor-pointer text-sm">
                {userInitial}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>

              {/* Mobile toggle */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="pt-2 pb-3 px-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined">{item.icon}</span>
                          {item.label}
                        </div>
                        <span className="material-symbols-outlined">
                          {openDropdown === item.label ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {openDropdown === item.label && (
                        <div className="pl-10 pr-3 py-2 space-y-1">
                          {item.dropdown.map((dropItem) => (
                            <NavLink
                              key={dropItem.path}
                              to={dropItem.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-sm font-medium ${isActive
                                  ? 'bg-blue-50 text-primary dark:bg-blue-900/40 dark:text-blue-300'
                                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                                }`
                              }
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {dropItem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.path!}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition-colors ${isActive
                          ? 'bg-blue-50 text-primary dark:bg-blue-900/40 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  )}
                </div>
              ))}
              {/* Upgrade CTA mobile */}
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-base font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                Upgrade Trial Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 flex flex-col">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientLayout;
