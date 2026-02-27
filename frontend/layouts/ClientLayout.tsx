import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    MapPinIcon,
    ListIcon,
    MenuIcon,
    XIcon,
    LogOutIcon,
    BellIcon
} from 'lucide-react';

const ClientLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    // Assume mock standard client for now. Later this will tie to authService context
    const userName = "Client User";

    const handleLogout = () => {
        // Implement token destruction later
        navigate('/login');
    };

    const navLinks = [
        { to: '/client', icon: HomeIcon, label: 'Dashboard & Announcements' },
        { to: '/client/auctions', icon: BellIcon, label: 'Live Auctions' },
        { to: '/client/properties', icon: MapPinIcon, label: 'Property Search' },
        { to: '/client/lists', icon: ListIcon, label: 'My Lists & Research' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        Client Portal
                    </span>
                    <button
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XIcon size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/client'}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'}
              `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon className="h-5 w-5 opacity-75" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex flex-shrink-0 items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                                {userName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                {userName}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-md transition-colors"
                            title="Logout"
                        >
                            <LogOutIcon size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <MenuIcon size={24} />
                    </button>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">Portal</span>
                    <div className="w-10"></div> {/* Placeholder to balance layout */}
                </header>

                {/* Dynamic Route Content */}
                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ClientLayout;
