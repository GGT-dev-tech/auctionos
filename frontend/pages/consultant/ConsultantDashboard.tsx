import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsultantService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';

interface Listing {
    id: number;
    parcel_id: string;
    address: string;
    county: string;
    state: string;
    property_type?: string;
    assessed_value?: number;
    amount_due?: number;
    lot_acres?: number;
    owner_name?: string;
    availability_status: string;
}

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string; bg: string }> = ({ icon, label, value, color, bg }) => (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 ${bg}`}>
        <span className={`material-symbols-outlined text-[28px] ${color}`}>{icon}</span>
        <div>
            <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
        </div>
    </div>
);

const ConsultantDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const user = AuthService.getCurrentUser();
    const displayName = user?.full_name || user?.email?.split('@')[0] || 'Consultant';

    useEffect(() => {
        ConsultantService.getMe()
            .then(data => setProfile(data))
            .catch(() => setProfile(null))
            .finally(() => setProfileLoading(false));

        ConsultantService.getListings({ limit: 12 })
            .then(data => setListings(data.items || []))
            .catch(() => setListings([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        Welcome, <span className="text-emerald-600">{displayName}</span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Your consultant partner dashboard.
                        {profile && profile.verification_status === 'pending' && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase">
                                Verification Pending
                            </span>
                        )}
                        {profile && profile.verification_status === 'verified' && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase">
                                ✓ Verified Partner
                            </span>
                        )}
                    </p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon="home_work" label="Available Listings" value={listings.length} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                <StatCard icon="task_alt" label="Open Tasks" value="—" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                <StatCard icon="payments" label="Commission Model" value={profile?.commission_model || '—'} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
                <StatCard icon="verified" label="Status" value={profile?.verification_status || 'Pending'} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
            </div>

            {/* Profile Card */}
            {!profileLoading && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-2xl shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.name || displayName}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email || user?.email}</p>
                        {profile?.phone && <p className="text-sm text-slate-500 dark:text-slate-400">{profile.phone}</p>}
                    </div>
                    <button
                        onClick={() => navigate('/consultant/profile')}
                        className="px-4 py-2 text-sm font-bold border border-emerald-400 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
            )}

            {/* Listings */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">home_work</span>
                            Available Properties for Partnerships
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Properties you can approach owners and negotiate referral commissions</p>
                    </div>
                    <button
                        onClick={() => navigate('/consultant/listings')}
                        className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-widest"
                    >
                        View All →
                    </button>
                </div>

                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                        No listings available right now.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listings.slice(0, 9).map(p => (
                            <div
                                key={p.id}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-emerald-400/50 hover:shadow-md transition-all cursor-pointer"
                            >
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{p.address || p.parcel_id}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold tracking-widest">{p.county}, {p.state}</p>

                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {p.assessed_value && (
                                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg">
                                            ARV: ${Number(p.assessed_value).toLocaleString()}
                                        </span>
                                    )}
                                    {p.amount_due && (
                                        <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-lg">
                                            Due: ${Number(p.amount_due).toLocaleString()}
                                        </span>
                                    )}
                                    {p.lot_acres && (
                                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg">
                                            {Number(p.lot_acres).toFixed(2)} ac
                                        </span>
                                    )}
                                </div>

                                {p.owner_name && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                        <span className="truncate">{p.owner_name}</span>
                                    </div>
                                )}

                                <button className="mt-3 w-full text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                    Connect with Owner
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Tasks Placeholder */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-blue-500">task_alt</span>
                    Paid Tasks (Due Diligence & Field Research)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Complete field tasks assigned by GoAuct and earn compensation. Tasks include property visits, owner interviews, and due diligence reports.
                </p>
                <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-slate-800/50 rounded-xl border border-blue-100 dark:border-blue-900">
                    <span className="material-symbols-outlined text-2xl text-blue-400">hourglass_empty</span>
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks available at the moment</p>
                        <p className="text-xs text-slate-500">New tasks are published weekly. Check back soon.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ConsultantDashboard;
