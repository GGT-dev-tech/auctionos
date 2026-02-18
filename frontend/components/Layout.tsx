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
    { icon: 'search', label: 'List Search', path: '/search' },
    { icon: 'real_estate_agent', label: 'Property Search and Editing', path: '/inventory' },
    { icon: 'inventory_2', label: 'My Inventory', path: '/my-inventory' },
    { icon: 'calendar_month', label: 'Auction Calendar', path: '/calendar' },
    { icon: 'description', label: 'Reports', path: '/reports' },
    { icon: 'monitoring', label: 'Financials', path: '/financials' },
    { icon: 'analytics', label: 'Analysis', path: '/analysis' },
    { icon: 'upload_file', label: 'Import Data', path: '/admin/import' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-[#1a2634] border-r border-[#e7ecf3] dark:border-slate-700 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="p-6">
              <div className="flex flex-col">
                <h1 className="text-[#0d131b] dark:text-white text-xl font-bold leading-normal">AuctionOS</h1>
                <p className="text-[#4c6c9a] dark:text-slate-400 text-sm font-normal leading-normal">Admin Portal</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2 px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-[#4c6c9a] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={`material-symbols-outlined ${item.path === location.pathname ? 'text-primary' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm leading-normal">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-[#e7ecf3] dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="size-10 rounded-full bg-cover bg-center border border-slate-200"
                style={{ backgroundImage: `url('${user?.avatar}')` }}
              ></div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-[#0d131b] dark:text-white text-sm font-bold truncate">{user?.email || 'User'}</p>
                <p className="text-[#4c6c9a] dark:text-slate-400 text-xs truncate">{user?.role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#e7ecf3] dark:border-slate-700 bg-white dark:bg-[#1a2634] px-6 py-4 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-[#0d131b] dark:text-white text-lg font-bold hidden sm:block">Admin Console</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-64 hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f6f7f8] dark:bg-slate-800 border-none text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50"
                placeholder="Search..."
                type="text"
              />
            </div>
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2634]"></span>
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};