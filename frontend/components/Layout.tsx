import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuctionService } from '../services/api';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const user = AuctionService.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    AuctionService.logout();
    navigate('/login');
  };

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'real_estate_agent', label: 'Inventory', path: '/inventory' },
    { icon: 'inventory_2', label: 'My Inventory', path: '/my-inventory' },
    { icon: 'gavel', label: 'Auctions', path: '/auctions' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display flex flex-col">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-[#1a2634] border-b border-[#e7ecf3] dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-[#0d131b] dark:text-white text-lg font-bold hidden md:block">AuctionOS</span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:ml-8 md:flex md:space-x-4 items-center">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.email || 'User'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Agent'}</span>
                </div>
                <div
                  className="size-9 rounded-full bg-cover bg-center border border-slate-200 cursor-pointer"
                  style={{ backgroundImage: `url('${user?.avatar || '/placeholder.png'}')` }}
                ></div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="flex item-center md:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};