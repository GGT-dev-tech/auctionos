import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardService, AuctionService } from '../services/api';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);

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
  }, []);

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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-sky-600">Welcome to Parcel Fair!</h1>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link to="/map" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
            <span className="material-symbols-outlined">map</span> Map Search
          </Link>
          <Link to="/parcel" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
            <span className="material-symbols-outlined">search</span> List Search
          </Link>
          <Link to="/calendar" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2">
            <span className="material-symbols-outlined">calendar_today</span> Auction Calendar
          </Link>
        </div>
      </div>

      {/* 3 Key Stats Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">

        {/* Favorites */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white py-3 text-lg font-bold">My Favorites</div>
          <div className="p-6">
            <div className="grid grid-cols-3 divide-x divide-slate-200 mb-6">
              <div>
                <div className="text-3xl font-bold text-green-600">{data?.quick_stats?.favorites_count || 0}</div>
                <div className="text-xs text-slate-500">Total<br />Favorites</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Deeds &<br />Foreclosures</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Tax<br />Liens</div>
              </div>
            </div>
            <Link to="/favorites" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow">
              View My Favorites
            </Link>
          </div>
        </div>

        {/* Saved Lists */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white py-3 text-lg font-bold">My Saved Lists</div>
          <div className="p-6">
            <div className="grid grid-cols-3 divide-x divide-slate-200 mb-6">
              <div>
                <div className="text-3xl font-bold text-green-600">{data?.quick_stats?.lists_count || 0}</div>
                <div className="text-xs text-slate-500">Saved<br />Lists</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Deeds &<br />Foreclosures</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Tax<br />Liens</div>
              </div>
            </div>
            <Link to="/lists" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow">
              View My Saved Lists
            </Link>
          </div>
        </div>

        {/* Price Notices */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white py-3 text-lg font-bold">My Price Notices</div>
          <div className="p-6">
            <div className="grid grid-cols-3 divide-x divide-slate-200 mb-6">
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Total<br />Price Notices</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Active<br />Price Notices</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-xs text-slate-500">Expired<br />Price Notices</div>
              </div>
            </div>
            <a href="#" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow">
              Price Notice Organizer
            </a>
          </div>
        </div>

      </div>

      {/* Top Auctions Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Deed & Foreclosure */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-700 text-white py-3 px-4 text-lg font-bold">
            Top Deed & Foreclosure Auctions
          </div>
          <div className="bg-white border-b border-slate-200 p-3 flex justify-between text-sm font-bold">
            <h4>Auctions: <span className="text-green-600">{upcomingAuctions.length}</span></h4>
            <h4>Tax Deeds: <span className="text-green-600">{upcomingAuctions.reduce((acc, c) => acc + (c.property_count || 100), 0).toLocaleString()}</span></h4>
          </div>
          <div className="divide-y divide-slate-200">
            {upcomingAuctions.slice(0, 7).map((auc, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="bg-white border border-slate-300 rounded text-center min-w-[50px] cursor-pointer hover:bg-slate-100 p-1">
                    <div className="text-xl font-bold text-slate-800 leading-none">{new Date(auc.auction_date).getDate()}</div>
                    <div className="text-xs uppercase text-slate-500 font-bold leading-none">{new Date(auc.auction_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">{auc.state}: {auc.county} Auction</div>
                    <div className="text-xs text-blue-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">bolt</span> Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-700">{auc.property_count || 123}</div>
                    <div className="text-xs text-slate-500">parcels</div>
                  </div>
                  <Link to={`/calendar/${auc.state}`} className="btn btn-sm text-slate-500 hover:text-blue-600">
                    <span className="material-symbols-outlined">search</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 text-center bg-slate-50 border-t border-slate-200">
            <Link to="/calendar" className="text-green-600 font-bold hover:underline flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">new_window</span> Tax Deed & Foreclosure Auction Calendar
            </Link>
          </div>
        </div>

        {/* Tax Lien Auctions */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-700 text-white py-3 px-4 text-lg font-bold">
            Top Tax Lien Auctions
          </div>
          <div className="bg-white border-b border-slate-200 p-3 flex justify-between text-sm font-bold">
            <h4>Auctions: <span className="text-green-600">54</span></h4>
            <h4>Tax Liens: <span className="text-green-600">49,511</span></h4>
          </div>
          <div className="divide-y divide-slate-200">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="bg-white border border-slate-300 rounded text-center min-w-[50px] cursor-pointer hover:bg-slate-100 p-1">
                    <div className="text-xl font-bold text-slate-800 leading-none">{10 + i}</div>
                    <div className="text-xs uppercase text-slate-500 font-bold leading-none">MAY</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">FL: Example Lien Auction #{2000 + i}</div>
                    <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">bolt</span> Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-700">{(i * 900).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">parcels</div>
                  </div>
                  <button className="btn btn-sm text-slate-500 hover:text-blue-600">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 text-center bg-slate-50 border-t border-slate-200">
            <Link to="/calendar" className="text-green-600 font-bold hover:underline flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">new_window</span> Tax Lien Auction Calendar
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};