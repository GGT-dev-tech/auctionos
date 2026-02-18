import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardService, AuctionService } from '../services/api';
import { AuctionDetailsModal } from '../components/AuctionDetailsModal';
import { AuctionEvent } from '../types';
import { MoreVertical, MapPin, List, Info, Search } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<AuctionEvent | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardData, calendarData] = await Promise.all([
          DashboardService.getInitData(),
          AuctionService.getCalendar()
        ]);

        setData(dashboardData);

        // Process Calendar Data for Top Auctions
        const upcoming = Object.entries(calendarData)
          .flatMap(([date, auctions]: [string, any]) => auctions)
          .filter((a: any) => new Date(a.auction_date) >= new Date())
          .sort((a: any, b: any) => new Date(a.auction_date).getTime() - new Date(b.auction_date).getTime())
          .slice(0, 10);
        setUpcomingAuctions(upcoming);

      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Close dropdowns on outside click
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Alert Banner */}
      <div className="mb-8 text-center">
        <a href="#" className="inline-block bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors w-full md:w-auto">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-bold text-lg">
              Getting Started with Parcel Fair? Don't miss our next Parcel Fair 101 Online Training on {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}!
            </span>
          </div>
          <div className="text-sm text-green-600 mt-1">click for registration details</div>
        </a>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Welcome to Parcel Fair!</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link to="/map" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" /> Map Search
          </Link>
          <Link to="/parcel" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 text-sm">
            <Search className="w-4 h-4" /> List Search
          </Link>
          <Link to="/calendar" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 text-sm">
            <CalendarIcon /> Auction Calendar
          </Link>
        </div>
      </div>

      {/* 3 Key Stats Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">

        {/* Favorites */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white py-2 text-lg font-bold">My Favorites</div>
          <div className="p-4">
            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-600 mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">{data?.quick_stats?.favorites_count || 0}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Total<br />Favorites</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Deeds &<br />Foreclosures</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Tax<br />Liens</div>
              </div>
            </div>
            <Link to="/favorites" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-6 rounded shadow text-sm">
              View My Favorites
            </Link>
          </div>
        </div>

        {/* Saved Lists */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white py-2 text-lg font-bold">My Saved Lists</div>
          <div className="p-4">
            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-600 mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">{data?.quick_stats?.lists_count || 0}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Saved<br />Lists</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Deeds &<br />Foreclosures</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Tax<br />Liens</div>
              </div>
            </div>
            <Link to="/lists" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-6 rounded shadow text-sm">
              View My Saved Lists
            </Link>
          </div>
        </div>

        {/* Price Notices */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white py-2 text-lg font-bold">My Price Notices</div>
          <div className="p-4">
            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-600 mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Total<br />Price Notices</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Active<br />Price Notices</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Expired<br />Price Notices</div>
              </div>
            </div>
            <a href="#" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-6 rounded shadow text-sm">
              Price Notice Organizer
            </a>
          </div>
        </div>

      </div>

      {/* Top Auctions Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Deed & Foreclosure */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-700 text-white py-3 px-4 text-lg font-bold">
            Top Deed & Foreclosure Auctions
          </div>
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between text-sm font-bold">
            <h4 className="text-slate-700 dark:text-slate-200">Auctions: <span className="text-green-600">{upcomingAuctions.length}</span></h4>
            <h4 className="text-slate-700 dark:text-slate-200">Tax Deeds: <span className="text-green-600">{upcomingAuctions.reduce((acc, c) => acc + (c.property_count || 100), 0).toLocaleString()}</span></h4>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {upcomingAuctions.slice(0, 7).map((auc, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-center min-w-[50px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 p-1"
                    onClick={() => setSelectedAuction(auc)}
                  >
                    <div className="text-xl font-bold text-slate-800 dark:text-white leading-none">{new Date(auc.auction_date).getDate()}</div>
                    <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold leading-none">{new Date(auc.auction_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm md:text-base">{auc.state}: {auc.county} Auction</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">bolt</span> Online
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{auc.property_count || 123}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">parcels</div>
                  </div>

                  {/* Dropdown Action Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => toggleDropdown(e, `deed-${i}`)}
                      className="btn btn-sm btn-ghost p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300">
                        <Search className="w-3 h-3" />
                        <span className="text-xs font-bold">Actions</span>
                      </div>
                    </button>
                    {openDropdownId === `deed-${i}` && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-20 border border-slate-200 dark:border-slate-700">
                        <Link to={`/map?state=${auc.state}&county=${auc.county}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" /> View on Map
                        </Link>
                        <Link to={`/parcel?state=${auc.state}&county=${auc.county}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <List className="w-4 h-4 mr-2 text-green-500" /> View List
                        </Link>
                        <button onClick={() => setSelectedAuction(auc)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <Info className="w-4 h-4 mr-2 text-yellow-500" /> Auction Info
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 text-center bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <Link to="/calendar" className="text-green-600 font-bold hover:underline flex items-center justify-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm">open_in_new</span> Tax Deed & Foreclosure Auction Calendar
            </Link>
          </div>
        </div>

        {/* Tax Lien Auctions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-700 text-white py-3 px-4 text-lg font-bold">
            Top Tax Lien Auctions
          </div>
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between text-sm font-bold">
            <h4 className="text-slate-700 dark:text-slate-200">Auctions: <span className="text-green-600">54</span></h4>
            <h4 className="text-slate-700 dark:text-slate-200">Tax Liens: <span className="text-green-600">49,511</span></h4>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => {
              const mockLienAuction: AuctionEvent = {
                id: `lien-${i}`,
                state: 'FL',
                county: `Example Lien Auction #${2000 + i}`,
                auction_type: 'tax_lien',
                start_date: new Date(2026, 4, 10 + i).toISOString(),
                status: 'active',
                property_count: i * 900,
                notes: 'This is a mock auction entry for demonstration purposes.',
                location: 'Online'
              };

              return (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-center min-w-[50px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 p-1"
                      onClick={() => setSelectedAuction(mockLienAuction)}>
                      <div className="text-xl font-bold text-slate-800 dark:text-white leading-none">{10 + i}</div>
                      <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold leading-none">MAY</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm md:text-base">{mockLienAuction.state}: {mockLienAuction.county}</div>
                      <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">bolt</span> Online
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{(mockLienAuction.property_count || 0).toLocaleString()}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">parcels</div>
                    </div>

                    {/* Dropdown Action Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(e, `lien-${i}`)}
                        className="btn btn-sm btn-ghost p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300">
                          <Search className="w-3 h-3" />
                          <span className="text-xs font-bold">Actions</span>
                        </div>
                      </button>
                      {openDropdownId === `lien-${i}` && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-20 border border-slate-200 dark:border-slate-700">
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" /> View on Map
                          </a>
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                            <List className="w-4 h-4 mr-2 text-green-500" /> View List
                          </a>
                          <button onClick={() => setSelectedAuction(mockLienAuction)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                            <Info className="w-4 h-4 mr-2 text-yellow-500" /> Auction Info
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 text-center bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <Link to="/calendar" className="text-green-600 font-bold hover:underline flex items-center justify-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm">open_in_new</span> Tax Lien Auction Calendar
            </Link>
          </div>
        </div>

      </div>

      <AuctionDetailsModal
        auction={selectedAuction}
        onClose={() => setSelectedAuction(null)}
      />
    </div>
  );
};

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);